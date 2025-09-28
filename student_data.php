<?php
session_start();
header('Content-Type: application/json');

// 🔹 DB config
$host = "localhost";
$dbname = "pcs_db";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit();
}

// 🔹 Check authentication
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || $_SESSION['role'] !== 'student') {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit();
}

$student_id = $_SESSION['student_id'] ?? null;
if (!$student_id) {
    echo json_encode(['status' => 'error', 'message' => 'Student ID missing in session']);
    exit();
}

// 🔹 Fetch student data via stored procedure
$stmt = $conn->prepare("CALL GetStudentData(?)");
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
    exit();
}

$stmt->bind_param("i", $student_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $full_name = trim($row['First_Name'] . ' ' . ($row['Middle_Name'] ? $row['Middle_Name'] . ' ' : '') . $row['Last_Name']);

    $studentData = [
        'student_id'    => $row['Student_ID'],
        'full_name'     => $full_name,
        'first_name'    => $row['First_Name'],
        'middle_name'   => $row['Middle_Name'] ?? '',
        'last_name'     => $row['Last_Name'],
        'email'         => $row['Email'] ?? '',
        'contact_no'    => $row['Contact_No'] ?? '',
        'address'       => $row['Address'] ?? '',
        'grade_level'   => $row['Grade_level'] ?? '',
        'grade_display' => $row['grade_display'] ?? '',
        'section'       => $row['Section'] ?? '',
        'school_year'   => $row['School_Year'] ?? ''
    ];

    echo json_encode(['status' => 'success', 'data' => $studentData]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Student not found']);
}

$stmt->close();
$conn->close();
