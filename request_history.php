<?php
// request_history.php
session_start();
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Check if user is logged in as student
if (!isset($_SESSION['student_id']) || $_SESSION['role'] != 'student') {
    http_response_code(401);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Unauthorized access. Please login.'
    ]);
    exit();
}

// Database connection
$host = "localhost";
$dbname = "pcs_db";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit();
}

$student_id = $_SESSION['student_id'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getRequestHistory':
            getRequestHistory($conn, $student_id);
            break;
            
        case 'getRequestDetails':
            getRequestDetails($conn, $student_id);
            break;
            
        case 'cancelRequest':
            cancelRequest($conn, $student_id);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Invalid action specified'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("Exception in request_history.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

$conn->close();

function getRequestHistory($conn, $student_id) {
    try {
        $sql = "
            SELECT 
                rd.Request_Doc_ID,
                dr.Request_ID,
                rd.Document_ID,
                rd.Document_Type,
                rd.Quantity,
                rd.Unit_Price,
                rd.Subtotal,
                dr.Payment_Method,
                dr.Date_Requested,
                dr.Status,
                dr.Scheduled_Pick_Up,
                dr.Total_Amount
            FROM request_documents rd
            INNER JOIN document_requests dr ON rd.Request_ID = dr.Request_ID
            WHERE dr.Student_ID = ?
            ORDER BY dr.Date_Requested DESC, dr.Request_ID DESC
        ";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("i", $student_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $requests = [];
        
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        
        $stmt->close();
        
        echo json_encode([
            'status' => 'success',
            'data' => $requests,
            'count' => count($requests)
        ]);
        
    } catch (Exception $e) {
        error_log("Error in getRequestHistory: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Failed to load request history: ' . $e->getMessage(),
            'data' => []
        ]);
    }
}

function getRequestDetails($conn, $student_id) {
    $request_id = $_GET['request_id'] ?? 0;
    
    if (!$request_id || !is_numeric($request_id)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Invalid request ID'
        ]);
        return;
    }
    
    try {
        $sql = "
            SELECT 
                dr.Request_ID,
                dr.Payment_Method,
                dr.Date_Requested,
                dr.Status,
                dr.Scheduled_Pick_Up,
                dr.Total_Amount,
                dr.Date_Processed,
                dr.Notes,
                rd.Request_Doc_ID,
                rd.Document_ID,
                rd.Document_Type,
                rd.Quantity,
                rd.Unit_Price,
                rd.Subtotal
            FROM document_requests dr
            INNER JOIN request_documents rd ON dr.Request_ID = rd.Request_ID
            WHERE dr.Request_ID = ? AND dr.Student_ID = ?
        ";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ii", $request_id, $student_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $request = $result->fetch_assoc();
        
        $stmt->close();
        
        if ($request) {
            echo json_encode([
                'status' => 'success',
                'data' => $request
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Request not found or access denied'
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Error in getRequestDetails: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Failed to fetch request details: ' . $e->getMessage()
        ]);
    }
}

function cancelRequest($conn, $student_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $request_id = $input['request_id'] ?? $_POST['request_id'] ?? 0;
    
    if (!$request_id || !is_numeric($request_id)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Invalid request ID'
        ]);
        return;
    }
    
    try {
        $conn->begin_transaction();
        
        $stmt = $conn->prepare("SELECT Status FROM document_requests WHERE Request_ID = ? AND Student_ID = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ii", $request_id, $student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $request = $result->fetch_assoc();
        $stmt->close();
        
        if (!$request) {
            $conn->rollback();
            http_response_code(404);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Request not found'
            ]);
            return;
        }
        
        if (strtolower($request['Status']) !== 'pending') {
            $conn->rollback();
            http_response_code(400);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Only pending requests can be cancelled'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("UPDATE document_requests SET Status = 'Cancelled' WHERE Request_ID = ? AND Student_ID = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ii", $request_id, $student_id);
        $success = $stmt->execute();
        $stmt->close();
        
        if ($success && $conn->affected_rows > 0) {
            $conn->commit();
            echo json_encode([
                'status' => 'success',
                'message' => 'Request cancelled successfully'
            ]);
        } else {
            $conn->rollback();
            http_response_code(500);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Failed to cancel request'
            ]);
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error in cancelRequest: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>