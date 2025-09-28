<?php
session_start();

// Check if this is a direct browser access (not AJAX)
$isAjaxRequest = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
$acceptsJson = isset($_SERVER['HTTP_ACCEPT']) && 
               strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

// If not an AJAX request, redirect directly
if (!$isAjaxRequest && !$acceptsJson) {
    // Destroy session
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
        session_unset();
        session_destroy();
        
        // Clear session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
    }
    
    // Direct redirect to Login.html
    header('Location: Login.html');
    exit();
}

// For AJAX requests, return JSON (your existing code)
header('Content-Type: application/json');

// 🔹 Handle logout
if ($_SERVER["REQUEST_METHOD"] === "POST" || $_SERVER["REQUEST_METHOD"] === "GET") {
    
    // 🔹 Check if user is logged in
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in.']);
        exit();
    }

    // 🔹 Get user role before destroying session (for potential logging)
    $role = $_SESSION['role'] ?? 'unknown';
    $email = $_SESSION['email'] ?? '';

    // 🔹 Destroy all session data
    session_unset();     // Remove all session variables
    session_destroy();   // Destroy the session
    
    // 🔹 Clear session cookie if it exists
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // 🔹 Return success response
    echo json_encode([
        'status'   => 'success',
        'message'  => 'Logged out successfully.',
        'redirect' => 'Login.html'
    ]);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>