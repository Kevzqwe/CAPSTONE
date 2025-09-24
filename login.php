<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = "localhost";
$user = "Admin";
$pass = "Cutesikevin06";
$dbname = "pcs_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Input validation
    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
        exit();
    }

    try {
        // Call stored procedure with 2 parameters
        $stmt = $conn->prepare("CALL CheckUserLogin(?, ?)");
        $stmt->bind_param("ss", $email, $password);
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result && $row = $result->fetch_assoc()) {
            $message = $row['Message'];

            // Set session if login is successful
            if ($message === "Welcome Admin!") {
                $_SESSION['email'] = $email;
                $_SESSION['role'] = 'admin';
                $_SESSION['logged_in'] = true;
                
                echo json_encode([
                    'status' => 'success',
                    'message' => $message,
                    'role' => 'admin',
                    'redirect' => 'Admin_Dashboard.html'
                ]);
                
            } elseif ($message === "Welcome Student!") {
                $_SESSION['email'] = $email;
                $_SESSION['role'] = 'student';
                $_SESSION['logged_in'] = true;
                
                echo json_encode([
                    'status' => 'success',
                    'message' => $message,
                    'role' => 'student',
                    'redirect' => 'Student_Dashboard.html'
                ]);
                
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => $message
                ]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error processing login']);
        }

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
        error_log("Login error: " . $e->getMessage());
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>