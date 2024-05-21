<?php $user = getUserById($conn, $_SESSION['user_id']);
$msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['editProfile'])) {
	$username = $_POST['username'];
	$email = $_POST['email'];
	$password = $_POST['newPassword'];

	$msg = editProfile($conn, $username, $email, $password, $user['id']);
} ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<?php include 'infoMessage.php'; ?>
				<h2>Profil bearbeiten</h2>
				<form method="post">
					<div class="form-row">
						<label for="username">Benutzername:</label>
						<input type="text" id="username" name="username" value="<?php echo $user['username']; ?>">
					</div>
					<div class="form-row">
						<label for="email">E-Mail:</label>
						<input type="email" id="email" name="email" value="<?php echo $user['email']; ?>">
					</div>
					<div class="form-row">
						<label for="newPassword">Neues Passwort:</label>
						<input type="password" id="newPassword" name="newPassword">
					</div>
					<button type="submit" name="editProfile">Speichern</button>
				</form>
			</div>
		</div>
	</div>
</section>