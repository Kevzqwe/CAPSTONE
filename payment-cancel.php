<?php
session_start();
$request_id = $_GET['request_id'] ?? 0;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Payment Cancelled</title>
</head>
<body>
    <h1>Payment Cancelled</h1>
    <p>Your payment for request #<?php echo $request_id; ?> was cancelled.</p>
    <p>You can try again later.</p>
</body>
</html>