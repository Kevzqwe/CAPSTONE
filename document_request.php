<?php
// Enable error display for debugging
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

session_start();
header('Content-Type: application/json; charset=utf-8');

// Function to send JSON response and exit
function sendResponse($success, $message, $data = []) {
    $response = ['success' => $success, 'message' => $message];
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

// Safe array value access function
function getArrayValue($array, $key, $default = '') {
    return isset($array[$key]) ? $array[$key] : $default;
}

// PayMongo API Functions with better error handling
class PayMongoAPI {
    private $secretKey;
    private $baseUrl = 'https://api.paymongo.com/v1';
    private $isEnabled = false; // Disabled by default until proper keys are added
    
    public function __construct($secretKey) {
        $this->secretKey = $secretKey;
        // Only enable if we have a valid-looking key
        if (!empty($secretKey) && (strpos($secretKey, 'sk_test_') === 0 || strpos($secretKey, 'sk_live_') === 0)) {
            $this->isEnabled = true;
        }
    }
    
    public function isEnabled() {
        return $this->isEnabled;
    }
    
    private function makeRequest($endpoint, $method = 'POST', $data = null) {
        if (!$this->isEnabled) {
            throw new Exception('PayMongo is not configured properly. Please use Cash payment for now.');
        }
        
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($this->secretKey . ':'),
            'Accept: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PCS-Document-Request/1.0');
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('cURL Error: ' . $error);
        }
        
        $decodedResponse = json_decode($response, true);
        
        if ($httpCode >= 400) {
            $errorMessage = 'PayMongo API Error: ' . $httpCode;
            if (isset($decodedResponse['errors'])) {
                $errorDetails = [];
                foreach ($decodedResponse['errors'] as $error) {
                    $errorDetails[] = $error['detail'] ?? 'Unknown error';
                }
                $errorMessage .= ' - ' . implode(', ', $errorDetails);
            }
            throw new Exception($errorMessage);
        }
        
        return $decodedResponse;
    }
    
    public function createCheckoutSession($amount, $description, $successUrl, $cancelUrl, $metadata = [], $paymentMethods = []) {
        $amountInCents = intval(floatval($amount) * 100);
        
        // Default payment methods
        if (empty($paymentMethods)) {
            $paymentMethods = ['gcash', 'paymaya'];
        }
        
        $data = [
            'data' => [
                'attributes' => [
                    'send_email_receipt' => false,
                    'show_description' => true,
                    'show_line_items' => true,
                    'success_url' => $successUrl,
                    'cancel_url' => $cancelUrl,
                    'payment_method_types' => $paymentMethods,
                    'description' => $description,
                    'line_items' => [
                        [
                            'amount' => $amountInCents,
                            'currency' => 'PHP',
                            'name' => 'Document Request',
                            'quantity' => 1
                        ]
                    ],
                    'metadata' => $metadata
                ]
            ]
        ];
        
        return $this->makeRequest('/checkout_sessions', 'POST', $data);
    }
}

try {
    // Database config
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "pcs_db";

    // PayMongo Configuration - ADD YOUR REAL KEYS HERE LATER
    $paymongoSecretKey = "sk_test_xA4St1HSwB4dbJrnXABXefGj"; // Leave empty for now
    $paymongoPublicKey = "pk_test_gPv7DkDivkQxGYq6SXWXgLBz"; // Leave empty for now
    
    // Base URL for your application
    $baseUrl = "http://localhost:8000";

    // Connect to database
    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        sendResponse(false, 'Database connection failed: ' . $conn->connect_error);
    }

    // Read JSON input
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        sendResponse(false, 'No data received');
    }

    $data = json_decode($raw, true);
    if ($data === null) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg());
    }

    // Validate student info with safe array access
    $student = isset($data['studentInfo']) ? $data['studentInfo'] : [];
    $required = ['studentNumber', 'email', 'contactNo', 'surname', 'firstname', 'grade', 'section'];
    
    foreach($required as $field) {
        if (empty(getArrayValue($student, $field))) {
            sendResponse(false, "Missing required field: $field", ['received_student_data' => $student]);
        }
    }

    // Validate documents with safe array access
    $documents = isset($data['selectedDocs']) ? $data['selectedDocs'] : [];
    if (empty($documents)) {
        sendResponse(false, "No documents selected", ['received_docs' => $documents]);
    }

    // Validate payment method with safe array access
    $paymentMethod = getArrayValue($data, 'paymentMethod');
    if (empty($paymentMethod)) {
        sendResponse(false, "Payment method required");
    }

    // Prepare document data for JSON
    $documentData = [];
    $totalAmount = 0;

    // Process each document selection
    foreach ($documents as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        
        $documentId = intval(getArrayValue($doc, 'id', 0));
        $quantity = intval(getArrayValue($doc, 'quantity', 0));
        $price = floatval(getArrayValue($doc, 'price', 0));
        
        if ($quantity <= 0 || $documentId <= 0) continue;
        
        $documentData[] = [
            'id' => $documentId,
            'quantity' => $quantity,
            'price' => $price
        ];
        
        $totalAmount += $price * $quantity;
    }

    // Check if any valid documents were selected
    if (empty($documentData)) {
        sendResponse(false, "No valid documents selected");
    }

    // Prepare student name
    $surname = getArrayValue($student, 'surname');
    $firstname = getArrayValue($student, 'firstname');
    $middlename = getArrayValue($student, 'middlename');
    
    $studentName = $surname . ', ' . $firstname;
    if (!empty($middlename)) {
        $studentName .= ' ' . $middlename;
    }

    // Set default scheduled pickup (7 days from now)
    $scheduledPickup = date('Y-m-d', strtotime('+7 days'));

    // Get student values
    $studentNumber = intval(getArrayValue($student, 'studentNumber'));
    $grade = getArrayValue($student, 'grade');
    $section = getArrayValue($student, 'section');
    $contactNo = getArrayValue($student, 'contactNo');
    $email = getArrayValue($student, 'email');

    // Convert document data to JSON
    $documentJson = json_encode($documentData);

    // Define virtual payment methods
    $virtualPaymentMethods = ['gcash', 'maya'];

    // For now, treat all payments as cash until PayMongo is properly set up
    $paymentMethod = 'cash'; // Force cash payment for now
    
    $stmt = $conn->prepare("CALL InsertDocumentRequest(?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if ($stmt) {
        $stmt->bind_param(
            "issssssss",
            $studentNumber,
            $studentName,
            $grade,
            $section,
            $contactNo,
            $email,
            $paymentMethod,
            $scheduledPickup,
            $documentJson
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to execute stored procedure: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        if ($result && $row = $result->fetch_assoc()) {
            $requestId = $row['request_id'];
            $finalAmount = floatval($row['total_amount']);
            $message = $row['message'];
        } else {
            $requestId = $conn->insert_id;
            $finalAmount = floatval($totalAmount);
            $message = "Document request submitted successfully! Please pay cash upon pickup.";
        }

        if ($result) $result->close();
        $stmt->close();
        
        sendResponse(true, $message, [
            'grand_total' => floatval($finalAmount),
            'student_name' => $studentName,
            'documents_processed' => count($documentData),
            'request_id' => intval($requestId),
            'payment_redirect' => false,
            'payment_method' => $paymentMethod
        ]);
        
    } else {
        throw new Exception('Failed to prepare stored procedure: ' . $conn->error);
    }

} catch (Exception $e) {
    sendResponse(false, 'Error: ' . $e->getMessage());
}

if (isset($conn)) {
    $conn->close();
}
?>