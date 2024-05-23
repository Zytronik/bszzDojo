<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['forgotPassword'])) {
    $email = $_POST['email'];
    $msg = requestPasswordReset($conn, $email);
} ?>
<?php include 'infoMessage.php'; ?>
<h2>Passwort vergessen</h2>
<form method="post">
	<div class="form-row">
		<label for="email">E-Mail:</label>
		<input type="email" id="email" name="email" required>
	</div>
	<button type="submit" name="forgotPassword">Password zurücksetzen</button>
</form>
<a class="formBottomText" href="login.php">Zurück zum Login</a>