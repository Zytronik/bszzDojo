<?php $msg = [];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['requestBadge'])) {
	$badgeName = $_POST['badgeName'];
	$badgeRank = $_POST['badgeRank'];

	$msg = requestBadge($conn, $_SESSION['user_id'], $badgeName, $badgeRank);
} ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<?php include 'infoMessage.php'; ?>
				<h2>Auszeichnung anfordern</h2>
				<p class="lead">Da ich keinen Zugriff auf SM/Clubturnier Titel oder Abzeichen habe, kannst du hier deine anfordern.</p>
				<form method="post">
					<div class="form-row">
						<label for="badgeName">Name:</label>
						<input type="text" id="badgeName" name="badgeName" placeholder="bsp: Chlausschüsse 2023" required>
					</div>
					<div class="form-row">
						<label for="badgeRank">Platzierung:</label>
						<input type="number" id="badgeRank" name="badgeRank" min="1" max="3" placeholder="bsp: 1 - 3" required>
					</div>
					<button type="submit" name="requestBadge">Anfordern</button>
				</form>
			</div>
		</div>
	</div>
</section>