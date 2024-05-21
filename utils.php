<?php if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header("Location: index.php");
    exit();
}
include 'dbConfig.php';
include 'functions.php';
include 'data/bowTypes.php';
include 'data/ranks.php';
include 'data/badges.php';