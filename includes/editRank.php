<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['giveRank'])) {
	$rankName = $_POST['rankName'];
	$username = $_POST['username'];

	$msg = giveRank($conn, $rankName, $username);
} 
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['removeRank'])) {
	$rankName = $_POST['rankName'];
	$username = $_POST['username'];

	$msg = removeRank($conn, $rankName, $username);
} ?>
<?php include 'infoMessage.php'; ?>
<form method="post">
	<div class="form-row">
		<label for="rankName">Abzeichen Name:</label>
		<select name="rankName" id="rankName" required>
			<?php foreach (RANKS as $key => $rank): ?>
				<option value="<?php echo $key; ?>"><?php echo $rank['name']; ?></option>
			<?php endforeach; ?>
		</select>
	</div>
	<div class="form-row">
		<label for="username">Benutzername:</label>
		<input type="text" id="username" name="username" required>
	</div>
	<button type="submit" name="giveRank">Geben</button>
	<button type="submit" name="removeRank">Entfernen</button>
</form>