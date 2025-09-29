<?php
// sms_sender.php
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Function to clean phone number for Philippine format
function cleanPhoneNumber($number) {
    // Remove all non-digit characters
    $number = preg_replace('/[^0-9]/', '', $number);
    
    // Convert to international format (63)
    if (substr($number, 0, 1) === '0') {
        $number = '63' . substr($number, 1);
    } elseif (substr($number, 0, 2) !== '63' && strlen($number) === 10) {
        $number = '63' . $number;
    }
    
    return $number;
}

try {
    // Read JSON input
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        throw new Exception('No data received');
    }

    $data = json_decode($raw, true);
    if ($data === null) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // Validate required fields
    $required = ['phoneNumber', 'message'];
    foreach($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $phoneNumber = $data['phoneNumber'];
    $message = $data['message'];
    $senderName = isset($data['senderName']) ? $data['senderName'] : 'PCSchool';
    
    // Clean the phone number
    $cleanedNumber = cleanPhoneNumber($phoneNumber);
    
    // Validate phone number format
    if (strlen($cleanedNumber) < 11 || substr($cleanedNumber, 0, 2) !== '63') {
        throw new Exception('Invalid Philippine phone number format. Must start with 63 or 0. Received: ' . $phoneNumber);
    }
    
    // Your Semaphore API key
    $apiKey = "34f8081ed7a8f4f82f07662767274141";
    
    // Prepare POST data according to Semaphore API
    $postData = [
        'apikey' => $apiKey,
        'number' => $cleanedNumber,
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
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception('Network error: ' . $error);
    }
    
    // Parse Semaphore API response
    $result = json_decode($response, true);
    
    if ($httpCode !== 200) {
        throw new Exception('Semaphore API returned HTTP ' . $httpCode . ': ' . $response);
    }
    
    if (!is_array($result) || empty($result)) {
        throw new Exception('Invalid response format from Semaphore API');
    }
    
    // Check if message was accepted
    if (isset($result[0]['status']) && ($result[0]['status'] === 'Pending' || $result[0]['status'] === 'Sent')) {
        echo json_encode([
            'success' => true,
            'message' => 'SMS sent successfully',
            'message_id' => $result[0]['message_id'] ?? null,
            'status' => $result[0]['status']
        ]);
    } else {
        $errorMsg = $result[0]['message'] ?? 'Unknown error occurred';
        throw new Exception('Semaphore API error: ' . $errorMsg);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send SMS: ' . $e->getMessage()
    ]);
}
?>