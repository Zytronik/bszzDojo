<?php $monthlyBest = getMonthlyRankings($conn); ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2><?php echo getCurrentMonthName(); ?> Rangliste</h2>
				<p class="lead">Die besten mönatlichen Resultate, mit 30 Pfeilen und Faktor</p>
				<div class="tabs">
					<div class="tab active" data-tab-id="monthly-18m">18m</div>
					<div class="tab" data-tab-id="monthly-8m">8m</div>
				</div>
				<div class="tab-wrapper active" id="monthly-18m">
					<?php if (isset($monthlyBest["18"])) {
						$records = $monthlyBest["18"]; ?>
						<?php foreach ($records as $record) {
							$rank = sanitizeOutput($record['rank']);
							$result = sanitizeOutput($record['result']);
							$bowType = sanitizeOutput($record['bowType']);
							$createdAt = sanitizeOutput($record['createdAt']);
							$targetSize = sanitizeOutput($record['targetSize']);
							$isSpot = sanitizeOutput($record['isSpot']) ? ' Spot' : '';
							$tens = sanitizeOutput($record['tens']);
							$nines = sanitizeOutput($record['nines']);
							$username = sanitizeOutput($record['username']);
							$resultOriginal = sanitizeOutput($record['resultOriginal']);
							include "scoreRecordLeaderBoard.php";
						} ?>
					<?php } else { ?>
						<p>Keine Rekorde vorhanden.</p>
					<?php } ?>
				</div>

				<div class="tab-wrapper" id="monthly-8m">
					<?php if (isset($monthlyBest["8"])) {
						$records = $monthlyBest["8"]; ?>
						<?php foreach ($records as $record) {
							$rank = sanitizeOutput($record['rank']);
							$result = sanitizeOutput($record['result']);
							$bowType = sanitizeOutput($record['bowType']);
							$createdAt = sanitizeOutput($record['createdAt']);
							$targetSize = sanitizeOutput($record['targetSize']);
							$isSpot = sanitizeOutput($record['isSpot']) ? ' Spot' : '';
							$tens = sanitizeOutput($record['tens']);
							$nines = sanitizeOutput($record['nines']);
							$username = sanitizeOutput($record['username']);
							include "scoreRecordLeaderBoard.php";
						} ?>
					<?php } else { ?>
						<p>Keine Rekorde vorhanden.</p>
					<?php } ?>
				</div>
			</div>
		</div>
	</div>
</section>