<?php
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header("Location: index.php");
    exit();
}
function getCurrentMonthName()
{
    $months = [
        1 => 'Januar',
        2 => 'Februar',
        3 => 'März',
        4 => 'April',
        5 => 'Mai',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'August',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Dezember'
    ];

    $currentMonthNumber = (int) date('n');
    $currentMonthName = $months[$currentMonthNumber];

    echo $currentMonthName;
}
function usernameExists($conn, $username)
{
    $user = $conn->query("SELECT id FROM user WHERE username = '" . $username . "'");
    return $user->num_rows > 0;
}

function emailExists($conn, $email)
{
    $user = $conn->query("SELECT id FROM user WHERE email = '" . $email . "'");
    return $user->num_rows > 0;
}

function registerUser($conn, $username, $password, $email)
{
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $insertCredentials = "INSERT INTO user (username, passwordHash, email) VALUES ('" . dbSanitize($username) . "', '" . dbSanitize($password_hash) . "', '" . dbSanitize($email) . "')";
    if ($conn->query($insertCredentials)) {
        return "Registrierung erfolgreich.";
    } else {
        return "Es ist ein Fehler aufgetreten.";
    }
}

function loginUser($conn, $username, $password)
{
    $credentials = $conn->query("SELECT id, passwordHash FROM user WHERE username = '" . $username . "'");
    if ($credentials->num_rows > 0) {
        $users = $credentials->fetch_assoc();
        $id = $users['id'];
        $password_hash = $users['passwordHash'];
        if (password_verify($password, $password_hash)) {
            $_SESSION['user_id'] = sanitizeOutput($id);
            $_SESSION['username'] = sanitizeOutput($username);
            header("Location: index.php");
            exit();
        } else {
            return "Ungültiges Passwort.";
        }
    } else {
        return "Es wurde kein Benutzer mit diesem Benutzernamen gefunden.";
    }
}

function submitScore($conn, $userId, $bowType, $targetSize, $distance, $isSpot, $tens, $nines, $result, $arrows)
{
    $insertScore = "INSERT INTO score (userId, bowType, targetSize, distance, isSpot, tens, nines, result, numberOfArrows) VALUES ('
    " . dbSanitize($userId) . "',
    '" . dbSanitize($bowType) . "',
    '" . dbSanitize($targetSize) . "',
    '" . dbSanitize($distance) . "',
    '" . dbSanitize($isSpot) . "',
    '" . dbSanitize($tens) . "',
    '" . dbSanitize($nines) . "',
    '" . dbSanitize($result) . "',
    '" . dbSanitize($arrows) . "')";
    if ($conn->query($insertScore)) {
        return "Score submitted successfully.";
    } else {
        return "There was an error with your submission.";
    }
}

function dbSanitize($input)
{
    $input = trim($input);
    $input = addslashes($input);
    return $input;
}

function sanitizeOutput($input)
{
    return htmlspecialchars($input);
}