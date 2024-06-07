<?php
session_start();

if (!isset($_SESSION['user_id']) && !autoLogin($conn)) {
    header("Location: login.php");
    exit();
}