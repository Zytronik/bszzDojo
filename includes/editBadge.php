<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['giveBadge'])) {
	$badgeName = $_POST['badgeName'];
	$username = $_POST['username'];

	$msg = giveBadge($conn, $badgeName, $username);
}
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['removeBadge'])) {
	$badgeName = $_POST['badgeName'];
	$username = $_POST['username'];

	$msg = removeBadge($conn, $badgeName, $username);
} ?>
<?php include 'infoMessage.php'; ?>
<form method="post">
	<div class="form-row">
		<label for="badgeName">Auszeichnungs Name:</label>
		<select name="badgeName" id="badgeName" required>
			<?php foreach (BADGES as $key => $badge): ?>
				<option value="<?php echo $key; ?>"><?php echo $badge['name']; ?> | #<?php echo rankStringToNumber($badge['rank']); ?></option>
			<?php endforeach; ?>
		</select>
	</div>
	<div class="form-row">
		<label for="username">Benutzername:</label>
		<input type="text" id="username" name="username" required>
	</div>
	<button type="submit" name="giveBadge">Geben</button>
	<button type="submit" name="removeBadge">Entfernen</button>
</form>