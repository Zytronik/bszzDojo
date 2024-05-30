<?php include 'includes/sessionProtect.php'; 
include 'utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $userId = $_GET['id'];
    if ($userId && isAdmin($conn, $_SESSION['user_id'])) {
        // Begin a transaction
        $conn->begin_transaction();

        try {
            // Delete the user
            $sql = $conn->query("DELETE FROM user WHERE id = '".$userId."'");
            if (!$sql) {
                throw new Exception("Benutzer konnte nicht gelöscht werden.");
            }

            // Delete related records in scores table
            $sql = $conn->query("DELETE FROM score WHERE userId = '".$userId."'");
            if (!$sql) {
                throw new Exception("Benutzer-Score konnte nicht gelöscht werden.");
            }

            // Delete related records in requests table
            $sql = $conn->query("DELETE FROM request WHERE userId = '".$userId."'");
            if (!$sql) {
                throw new Exception("Benutzeranfragen konnten nicht gelöscht werden.");
            }

            // Delete related records in password_resets table
            $sql = $conn->query("DELETE FROM password_reset WHERE userId = '".$userId."'");
            if (!$sql) {
                throw new Exception("Passwort-Resets konnten nicht gelöscht werden.");
            }

            // Commit the transaction
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Benutzer und verwandte Daten erfolgreich gelöscht."]);

        } catch (Exception $e) {
            // Rollback the transaction if any query fails
            $conn->rollback();
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }

    } else {
        echo json_encode(["success" => false, "message" => "Benutzer nicht gefunden."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
}