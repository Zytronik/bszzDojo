<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
	$username = $_POST['username'];
	$password = $_POST['password'];
	
	$msg = loginUser($conn, $username, $password);
} ?>
<?php include 'infoMessage.php'; ?>
<h2>Einloggen</h2>
<form method="post">
	<div class="form-row">
		<label for="username">Benutzername:</label>
		<input type="text" id="username" name="username" required>
	</div>
	<div class="form-row">
		<label for="password">Passwort:</label>
		<input type="password" id="password" name="password" required>
	</div>
	<button type="submit" name="login">Einloggen</button>
</form>
<a class="formBottomText" href="forgotPassword.php">Passwort vergessen?</a>