<?php
session_start();
header('Content-Type: application/json');

// 🔹 Database config
$host = "localhost";
$dbname = "pcs_db";
$user = "root";
$pass = "";

// 🔹 Create connection
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit();
}

// 🔹 Handle login
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
        exit();
    }

    // 🔹 Call stored procedure
    $stmt = $conn->prepare("CALL CheckUserLogin(?, ?)");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit();
    }

    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $row = $result->fetch_assoc()) {
        $message    = $row['Message'] ?? '';
        $admin_id   = $row['Admin_ID'] ?? null;
        $student_id = $row['Student_ID'] ?? null;

        if ($message === "Welcome Admin!") {
            $_SESSION['logged_in'] = true;
            $_SESSION['role']      = 'admin';
            $_SESSION['email']     = $email;
            $_SESSION['admin_id']  = $admin_id;

            echo json_encode([
                'status'   => 'success',
                'message'  => $message,
                'role'     => 'admin',
                'redirect' => 'Admin_Dashboard.html'
            ]);

        } elseif ($message === "Welcome Student!") {
            $_SESSION['logged_in']  = true;
            $_SESSION['role']       = 'student';
            $_SESSION['email']      = $email;
            $_SESSION['student_id'] = $student_id; // ✅ store Student_ID

            echo json_encode([
                'status'   => 'success',
                'message'  => $message,
                'role'     => 'student',
                'redirect' => 'Student_Dashboard.html'
            ]);

        } else {
            echo json_encode(['status' => 'error', 'message' => $message ?: 'Invalid login.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

$conn->close();
