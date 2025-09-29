<?php
session_start();
$request_id = $_GET['request_id'] ?? 0;
$payment_intent = $_GET['payment_intent'] ?? '';

// Here you would typically verify the payment status with PayMongo
// and update your database accordingly

?>
<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: green; font-size: 24px; }
        .info { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="success">✅ Payment Successful!</div>
    <div class="info">
        <p>Your document request <strong>#<?php echo htmlspecialchars($request_id); ?></strong> has been paid successfully.</p>
        <p>Payment Reference: <?php echo htmlspecialchars($payment_intent); ?></p>
        <p>We will notify you when your documents are ready for pickup.</p>
    </div>
    <a href="/">Return to Home</a>
</body>
</html>