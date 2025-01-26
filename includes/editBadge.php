<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['giveBadge'])) {
	$badgeName = $_POST['badgeName'];
	$username = $_POST['username'];
	$year = $_POST['year'];
	$rank = $_POST['rank'];

	$msg = giveBadge($conn, $badgeName, $username, $year, $rank);

}
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['removeBadge'])) {
	$badgeName = $_POST['badgeName'];
	$username = $_POST['username'];
	$year = $_POST['year'];

	$msg = removeBadge($conn, $badgeName, $username, $year);
} ?>
<?php include 'infoMessage.php'; ?>
<form method="post">
	<div class="form-row">
		<label for="badgeName">Auszeichnungs Name:</label>
		<input type="text" id="badgeName" name="badgeName" required>
	</div>
	<div class="form-row">
		<label for="username">Benutzername:</label>
		<input type="text" id="username" name="username" required>
	</div>
	<div class="form-row">
		<label for="year">Jahr:</label>
		<input type="number" id="year" name="year" required>
	</div>
	<div class="form-row">
		<label for="rank">Platzierung:</label>
		<select name="rank" id="rank" required>
			<option value="1">Gold</option>
			<option value="2">Silber</option>
			<option value="3">Bronze</option>
		</select>
	</div>
	<button type="submit" name="giveBadge">Geben</button>
	<button type="submit" name="removeBadge">Entfernen</button>
</form>