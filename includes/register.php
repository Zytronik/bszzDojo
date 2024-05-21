<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['register'])) {
	$username = $_POST['username'];
	$password = $_POST['password'];
	$email = $_POST['email'];

	if (usernameExists($conn, $username) || emailExists($conn, $email)) {
		$msg = ["error", "Benutzername oder E-Mail bereits vergeben."];
	} else {
		$msg =  registerUser($conn, $username, $password, $email);
	}
} ?>
<?php include 'infoMessage.php'; ?>
<h2>Registrieren</h2>
<form method="post">
	<div class="form-row">
		<label for="username">Benutzername:</label>
		<input type="text" id="username" name="username" required>
	</div>
	<div class="form-row">
		<label for="email">E-Mail:</label>
		<input type="email" id="email" name="email" required>
	</div>
	<div class="form-row">
		<label for="password">Passwort:</label>
		<input type="password" id="password" name="password" required>
	</div>
	<button type="submit" name="register">Registrieren</button>
</form>