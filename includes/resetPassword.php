<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['resetPassword'])) {
    $token = $_POST['token'];
    $password = $_POST['password'];
    
    // Function to reset the password
    $msg = resetUserPassword($conn, $token, $password);
}
?>
<?php include 'infoMessage.php'; ?>
<h2>Passwort zurücksetzen</h2>
<form method="post">
    <input type="hidden" name="token" value="<?php echo $_GET['token']; ?>">
    <div class="form-row">
        <label for="password">Neues Passwort:</label>
        <input type="password" id="password" name="password" required>
    </div>
    <button type="submit" name="resetPassword">Passwort zurücksetzen</button>
</form>
<a class="formBottomText" href="login.php">Zurück zum Login</a>
