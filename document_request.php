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

// Function to clean phone number for SMS - Now returns 09 format
function cleanPhoneNumber($number) {
    // Remove all non-digit characters
    $number = preg_replace('/[^0-9]/', '', $number);
    
    // If starts with 63, convert to 09 format
    if (substr($number, 0, 2) === '63') {
        $number = '0' . substr($number, 2);
    }
    // If starts with 0, keep as is (already in 09 format)
    elseif (substr($number, 0, 1) === '0') {
        // Already in correct format
    }
    // If starts with 9 (typical Philippine mobile), add 0
    elseif (substr($number, 0, 1) === '9' && strlen($number) === 10) {
        $number = '0' . $number;
    }
    
    return $number;
}

// Function to send SMS via Semaphore
function sendSMS($phoneNumber, $message, $senderName = 'PCSchool') {
    $apiKey = "34f8081ed7a8f4f82f07662767274141";
    
    // Clean the phone number to 09 format for storage/validation
    $cleanedNumber = cleanPhoneNumber($phoneNumber);
    
    // Validate phone number format (should be 09XXXXXXXXX)
    if (strlen($cleanedNumber) !== 11 || substr($cleanedNumber, 0, 2) !== '09') {
        throw new Exception('Invalid Philippine phone number format. Should be 09XXXXXXXXX: ' . $phoneNumber . ' -> ' . $cleanedNumber);
    }
    
    // Convert to 63 format for Semaphore API
    $apiNumber = '63' . substr($cleanedNumber, 1);
    
    // Prepare POST data according to Semaphore API
    $postData = [
        'apikey' => $apiKey,
        'number' => $apiNumber,
        'message' => $message,
        'sendername' => $senderName
    ];
    
    // Send to Semaphore API
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.semaphore.co/api/v4/messages',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($postData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Log the request for debugging
    error_log("SMS Request - Number: {$cleanedNumber} (API: {$apiNumber}), Message: " . substr($message, 0, 100));
    error_log("SMS Response - HTTP: {$httpCode}, Response: {$response}");
    
    if ($error) {
        throw new Exception('Network error: ' . $error);
    }
    
    if ($httpCode !== 200) {
        throw new Exception('Semaphore API returned HTTP ' . $httpCode);
    }
    
    $result = json_decode($response, true);
    
    if (!is_array($result) || empty($result)) {
        throw new Exception('Invalid response format from Semaphore API');
    }
    
    // Check if message was accepted
    if (isset($result[0]['status']) && ($result[0]['status'] === 'Pending' || $result[0]['status'] === 'Sent')) {
        return true;
    } else {
        $errorMsg = $result[0]['message'] ?? 'Unknown error occurred';
        throw new Exception('Semaphore API error: ' . $errorMsg);
    }
}

// PayMongo API Class
class PayMongoAPI {
    private $secretKey;
    private $baseUrl = "https://api.paymongo.com/v1";
    private $useCurl = true;
    
    public function __construct($secretKey) {
        $this->secretKey = $secretKey;
        if (!function_exists('curl_init')) {
            $this->useCurl = false;
        }
    }
    
    private function makeHttpRequest($url, $method = 'GET', $data = null) {
        if ($this->useCurl) {
            return $this->makeCurlRequest($url, $method, $data);
        } else {
            return $this->makeFileGetContentsRequest($url, $method, $data);
        }
    }
    
    private function makeCurlRequest($url, $method = 'GET', $data = null) {
        $curl = curl_init();
        
        $headers = [
            'accept: application/json',
            'authorization: Basic c2tfdGVzdF94QTRTdDFIU3dCNGRiSnJuWEFCWGVmR2o6',
            'content-type: application/json'
        ];
        
        $curlOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_CONNECTTIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT => 'PayMongo PHP Client/1.0'
        ];
        
        if ($method === 'POST') {
            $curlOptions[CURLOPT_POST] = true;
            if ($data) {
                $curlOptions[CURLOPT_POSTFIELDS] = json_encode($data);
            }
        }
        
        curl_setopt_array($curl, $curlOptions);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($err) {
            $this->useCurl = false;
            return $this->makeFileGetContentsRequest($url, $method, $data);
        }

        return [
            'response' => $response,
            'http_code' => $httpCode,
            'error' => null
        ];
    }
    
    private function makeFileGetContentsRequest($url, $method = 'GET', $data = null) {
        $context_options = [
            'http' => [
                'method' => $method,
                'header' => [
                    'Accept: application/json',
                    'Authorization: Basic ' . base64_encode($this->secretKey . ':'),
                    'Content-Type: application/json'
                ],
                'timeout' => 60,
                'ignore_errors' => true
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ];
        
        if ($method === 'POST' && $data) {
            $context_options['http']['content'] = json_encode($data);
        }
        
        $context = stream_context_create($context_options);
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            throw new Exception('HTTP request failed using file_get_contents');
        }
        
        $httpCode = 200;
        if (isset($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('/HTTP\/\d\.\d (\d{3})/', $header, $matches)) {
                    $httpCode = intval($matches[1]);
                    break;
                }
            }
        }
        
        return [
            'response' => $response,
            'http_code' => $httpCode,
            'error' => null
        ];
    }
    
    public function createPaymentIntent($amount, $description = '', $metadata = []) {
        $amountInCents = intval(floatval($amount) * 100);
        
        $postData = [
            'data' => [
                'attributes' => [
                    'amount' => $amountInCents,
                    'payment_method_allowed' => [
                        'qrph',
                        'card',
                        'dob',
                        'paymaya',
                        'billease',
                        'gcash',
                        'grab_pay'
                    ],
                    'payment_method_options' => [
                        'card' => [
                            'request_three_d_secure' => 'any'
                        ]
                    ],
                    'currency' => 'PHP',
                    'capture_type' => 'automatic'
                ]
            ]
        ];
        
        if (!empty($description)) {
            $postData['data']['attributes']['description'] = $description;
        }
        
        if (!empty($metadata)) {
            $flatMetadata = [];
            foreach ($metadata as $key => $value) {
                if (is_array($value) || is_object($value)) {
                    $flatMetadata[$key] = json_encode($value);
                } else {
                    $flatMetadata[$key] = strval($value);
                }
            }
            $postData['data']['attributes']['metadata'] = $flatMetadata;
        }
        
        $result = $this->makeHttpRequest($this->baseUrl . "/payment_intents", 'POST', $postData);
        
        if ($result['error']) {
            throw new Exception('HTTP Request Error: ' . $result['error']);
        }
        
        $decodedResponse = json_decode($result['response'], true);
        
        if ($result['http_code'] >= 400) {
            $errorMessage = 'PayMongo API Error: ' . $result['http_code'];
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
    
    public function processPayment($paymentIntentId, $paymentMethodType, $billingInfo = [], $returnUrl) {
        $paymentMethodData = [
            'data' => [
                'attributes' => [
                    'type' => $paymentMethodType,
                    'billing' => $billingInfo
                ]
            ]
        ];
        
        $result = $this->makeHttpRequest($this->baseUrl . "/payment_methods", 'POST', $paymentMethodData);

        if ($result['error']) {
            throw new Exception('Payment method creation error: ' . $result['error']);
        }
        
        $paymentMethodResult = json_decode($result['response'], true);
        
        if ($result['http_code'] >= 400 || !isset($paymentMethodResult['data']['id'])) {
            $errorMsg = 'Failed to create payment method';
            if (isset($paymentMethodResult['errors'])) {
                $errorDetails = [];
                foreach ($paymentMethodResult['errors'] as $error) {
                    $errorDetails[] = $error['detail'] ?? 'Unknown error';
                }
                $errorMsg .= ': ' . implode(', ', $errorDetails);
            }
            throw new Exception($errorMsg);
        }
        
        $paymentMethodId = $paymentMethodResult['data']['id'];
        
        $attachData = [
            'data' => [
                'attributes' => [
                    'payment_method' => $paymentMethodId,
                    'return_url' => $returnUrl
                ]
            ]
        ];
        
        $result = $this->makeHttpRequest($this->baseUrl . "/payment_intents/" . $paymentIntentId . "/attach", 'POST', $attachData);

        if ($result['error']) {
            throw new Exception('Payment attachment error: ' . $result['error']);
        }
        
        $attachResult = json_decode($result['response'], true);
        
        if ($result['http_code'] >= 400) {
            $errorMsg = 'Failed to attach payment method';
            if (isset($attachResult['errors'])) {
                $errorDetails = [];
                foreach ($attachResult['errors'] as $error) {
                    $errorDetails[] = $error['detail'] ?? 'Unknown error';
                }
                $errorMsg .= ': ' . implode(', ', $errorDetails);
            }
            throw new Exception($errorMsg);
        }
        
        return $attachResult;
    }
}

try {
    // Database config
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "pcs_db";

    // PayMongo Configuration
    $paymongoSecretKey = "sk_test_xA4St1HSwB4dbJrnXABXefGj";
    
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

    // Validate student info
    $student = isset($data['studentInfo']) ? $data['studentInfo'] : [];
    $required = ['studentNumber', 'email', 'contactNo', 'surname', 'firstname', 'grade', 'section'];
    
    foreach($required as $field) {
        if (empty(getArrayValue($student, $field))) {
            sendResponse(false, "Missing required field: $field", ['received_student_data' => $student]);
        }
    }

    // Process documents
    $documents = isset($data['selectedDocs']) ? $data['selectedDocs'] : [];
    if (empty($documents)) {
        sendResponse(false, "No documents selected", ['received_docs' => $documents]);
    }

    $paymentMethod = getArrayValue($data, 'paymentMethod');
    if (empty($paymentMethod)) {
        sendResponse(false, "Payment method required");
    }

    $documentData = [];
    $totalAmount = 0;

    foreach ($documents as $doc) {
        if (!is_array($doc)) continue;
        
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

    if (empty($documentData)) {
        sendResponse(false, "No valid documents selected");
    }

    // Prepare student data
    $surname = getArrayValue($student, 'surname');
    $firstname = getArrayValue($student, 'firstname');
    $middlename = getArrayValue($student, 'middlename');
    
    $studentName = $surname . ', ' . $firstname;
    if (!empty($middlename)) {
        $studentName .= ' ' . $middlename;
    }

    $scheduledPickup = date('Y-m-d', strtotime('+7 days'));
    $studentNumber = intval(getArrayValue($student, 'studentNumber'));
    $grade = getArrayValue($student, 'grade');
    $section = getArrayValue($student, 'section');
    $contactNo = getArrayValue($student, 'contactNo');
    $email = getArrayValue($student, 'email');

    // Clean contact number to 09 format before storing/using
    $contactNo = cleanPhoneNumber($contactNo);

    $documentJson = json_encode($documentData);
    $virtualPaymentMethods = ['gcash', 'maya', 'paymaya', 'card', 'grab_pay'];
    $paymongo = new PayMongoAPI($paymongoSecretKey);

    // Save to database
    $stmt = $conn->prepare("CALL InsertDocumentRequest(?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare stored procedure: ' . $conn->error);
    }

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
        $message = "Document request submitted successfully!";
    }

    if ($result) $result->close();
    $stmt->close();

    // Handle payment
    $paymentRedirect = false;
    $paymentUrl = null;
    $paymentIntentId = null;

    if (in_array($paymentMethod, $virtualPaymentMethods)) {
        try {
            $description = "Document Request #{$requestId} - {$studentName}";
            
            $metadata = [
                'request_id' => strval($requestId),
                'student_number' => strval($studentNumber),
                'student_name' => $studentName,
                'documents_count' => strval(count($documentData)),
                'total_amount' => strval($finalAmount),
                'grade_section' => $grade . ' - ' . $section
            ];

            $paymentIntent = $paymongo->createPaymentIntent($finalAmount, $description, $metadata);
            
            if (isset($paymentIntent['data']['id'])) {
                $paymentIntentId = $paymentIntent['data']['id'];
                
                $paymongoPaymentTypes = [
                    'gcash' => 'gcash',
                    'maya' => 'paymaya', 
                    'paymaya' => 'paymaya',
                    'card' => 'card',
                    'grab_pay' => 'grab_pay'
                ];
                
                $paymongoType = $paymongoPaymentTypes[$paymentMethod] ?? 'gcash';
                
                $billingInfo = [
                    'name' => $studentName,
                    'email' => $email,
                    'phone' => $contactNo
                ];

                $returnUrl = $baseUrl . "/payment-success.php?request_id=" . $requestId . "&payment_intent=" . $paymentIntentId;

                $paymentResult = $paymongo->processPayment($paymentIntentId, $paymongoType, $billingInfo, $returnUrl);
                
                if (isset($paymentResult['data']['attributes']['next_action']['redirect']['url'])) {
                    $paymentRedirect = true;
                    $paymentUrl = $paymentResult['data']['attributes']['next_action']['redirect']['url'];
                    $message = "Redirecting to payment gateway...";
                } else {
                    if (isset($paymentResult['data']['attributes']['status']) && 
                        $paymentResult['data']['attributes']['status'] === 'succeeded') {
                        $message = "Payment completed successfully!";
                    } else {
                        throw new Exception('Failed to get payment redirect URL from PayMongo');
                    }
                }
            } else {
                throw new Exception('Failed to create payment intent');
            }
            
        } catch (Exception $e) {
            $paymentMethod = 'cash';
            $updateStmt = $conn->prepare("UPDATE document_requests SET payment_method = ? WHERE request_id = ?");
            $updateStmt->bind_param("si", $paymentMethod, $requestId);
            $updateStmt->execute();
            $updateStmt->close();
            
            $message = "Online payment temporarily unavailable. Your request has been saved as cash payment. Error: " . $e->getMessage();
        }
    }

    // ✅ SEND SMS NOTIFICATION AUTOMATICALLY AFTER SUCCESSFUL REQUEST
    $smsSent = false;
    $smsMessage = "";
    
    try {
        // Create SMS message
        $smsText = "Hello {$firstname}! Your document request #{$requestId} has been received. ";
        $smsText .= "Total amount: ₱{$finalAmount}. ";
        
        if ($paymentMethod === 'cash') {
            $smsText .= "Payment method: Cash. Please proceed to the registrar's office for payment and processing.";
        } else {
            $smsText .= "Payment method: {$paymentMethod}. Please complete your payment online.";
        }
        
        $smsText .= " Scheduled pickup: {$scheduledPickup}. Thank you!";
        
        // Send SMS automatically - contactNo is already in 09 format
        sendSMS($contactNo, $smsText, 'PCSchool');
        $smsSent = true;
        $smsMessage = "SMS notification sent successfully!";
        
        error_log("✅ SMS sent successfully to {$contactNo} for request #{$requestId}");
        
    } catch (Exception $e) {
        $smsMessage = "SMS sending failed: " . $e->getMessage();
        error_log("❌ SMS failed for request #{$requestId}: " . $e->getMessage());
        // Don't throw error - SMS failure shouldn't affect the main request
    }

    // Send response
    sendResponse(true, $message, [
        'grand_total' => floatval($finalAmount),
        'student_name' => $studentName,
        'documents_processed' => count($documentData),
        'request_id' => intval($requestId),
        'payment_redirect' => $paymentRedirect,
        'payment_url' => $paymentUrl,
        'payment_intent_id' => $paymentIntentId,
        'payment_method' => $paymentMethod,
        'sms_sent' => $smsSent,
        'sms_message' => $smsMessage
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Error: ' . $e->getMessage());
}

if (isset($conn)) {
    $conn->close();
}
?>