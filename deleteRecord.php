<?php include 'utils.php';
include 'includes/sessionProtect.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $recordId = $_GET['id'];
    $userId = $_SESSION['user_id'];
    if ($recordId && $userId) {
        $sql = $conn->query("DELETE FROM score WHERE id = '" . $recordId . "' AND userId = '" . $userId . "'");
        if (!$sql) {
            throw new Exception("Score konnte nicht gelöscht werden.");
        }else{
            echo json_encode(["success" => true, "message" => "Eintrag wurde erfolgreich gelöscht."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Eintrag nicht gefunden."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
}