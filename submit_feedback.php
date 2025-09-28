<?php
header('Content-Type: application/json');
session_start();

// 🔹 Database config
$host   = "localhost";
$dbname = "pcs_db";
$user   = "root";
$pass   = "";

// 🔹 Connect to database
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit();
}

// 🔹 Handle only POST requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email      = trim($_POST['email'] ?? '');
    $type       = trim($_POST['feedbackType'] ?? '');
    $message    = trim($_POST['feedbackMessage'] ?? '');
    $studentId  = $_SESSION['student_id'] ?? null; // ✅ ensure student ID from login

    // 🔹 Validate inputs
    if ($studentId === null || $email === '' || $type === '' || $message === '') {
        echo json_encode([
            'status'  => 'error',
            'message' => 'All fields are required, and student must be logged in.'
        ]);
        exit();
    }

    try {
        // 🔹 Call stored procedure
        $stmt = $conn->prepare("CALL SaveFeedback(?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("isss", $studentId, $email, $type, $message);
        $stmt->execute();

        // 🔹 Try fetching the response from procedure
        $result = $stmt->get_result();
        if ($result && $row = $result->fetch_assoc()) {
            $feedbackMsg = $row['feedback_message'] ?? 'Feedback submitted successfully!';
        } else {
            $feedbackMsg = 'Feedback submitted successfully!';
        }

        echo json_encode([
            'status'  => 'success',
            'message' => $feedbackMsg
        ]);

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Invalid request method.'
    ]);
}

$conn->close();
