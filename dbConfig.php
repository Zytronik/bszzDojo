<?php if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header("Location: index.php");
    exit();
}

$user = 'root';
$password = '';
$dbname = 'bszzDojo';
$server = 'localhost';

$conn = new mysqli($server, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}