<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$bowType = $_POST['bowType'];
	$targetSize = $_POST['targetSize'];
	$distance = $_POST['distance'];
	$isSpot = isset($_POST['isSpot']) ? 1 : 0;
	$tens = $_POST['tens'];
	$nines = $_POST['nines'];
	$result = $_POST['result'];
	$arrows = $_POST['arrows'];

	if (isset($_POST['submitScore'])) {
		echo submitScore($conn, $_SESSION['user_id'], $bowType, $targetSize, $distance, $isSpot, $tens, $nines, $result, $arrows);
	}
} ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Erfasse einen neuen Score</h2>
				<form method="post">
					<div class="form-row">
						<label for="bowType">Bogenart:</label>
						<select name="bowType" id="bowType" required>
							<option value="r">Recurve</option>
							<option value="cp">Compound</option>
							<option value="tr">Traditionell</option>
							<option value="lb">Langbogen</option>
							<option value="bb">Barebow</option>
						</select>
					</div>
					<div class="form-row">
						<label for="targetSize">Scheibengrösse:</label>
						<select name="targetSize" id="targetSize" required>
							<option value="122">122cm</option>
							<option value="80">80cm</option>
							<option value="60">60cm</option>
							<option value="40">40cm</option>
						</select>
					</div>
					<div class="form-row checkbox">
						<label for="isSpot">Spot:
							<input id="isSpot" name="isSpot" type="checkbox">
							<span class="checkmark"></span>
						</label>
					</div>
					<div class="form-row">
						<label for="distance">Distanz:</label>
						<input type="number" id="distance" name="distance" min="0" required>
					</div>
					<div class="form-row">
						<label for="tens">10er:</label>
						<input type="number" id="tens" name="tens" min="0" required>
					</div>
					<div class="form-row">
						<label for="nines">9er:</label>
						<input type="number" id="nines" name="nines" min="0" required>
					</div>
					<div class="form-row">
						<label for="arrows">Anzahl Pfeile:</label>
						<input type="number" id="arrows" name="arrows" min="0" required>
					</div>
					<div class="form-row">
						<label for="result">Resultat:</label>
						<input type="number" id="result" name="result" min="0" required>
					</div>
					<button type="submit" name="submitScore">Speichern</button>
				</form>
			</div>
		</div>
	</div>
</section>