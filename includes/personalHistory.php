<?php
$personalHistory = getPersonalHistory($conn, $userId, 15);
?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Historie</h2>
				<?php if (empty($personalHistory)) { ?>
					<p>Keine Historie vorhanden.</p>
				<?php }else{ ?>
					<?php foreach ($personalHistory as $records) {
							$result = sanitizeOutput($record['result']);
							$bowType = sanitizeOutput($record['bowType']);
							$numberOfArrows = sanitizeOutput($record['numberOfArrows']);
							$createdAt = sanitizeOutput($record['createdAt']);
							$targetSize = sanitizeOutput($record['targetSize']);
							$isSpot = sanitizeOutput($record['isSpot']) ? ' Spot' : '';
							$tens = sanitizeOutput($record['tens']);
							$nines = sanitizeOutput($record['nines']);
							$rank = false;
							include "scoreRecord.php";
					} ?>
				<?php } ?>
			</div>
		</div>
	</div>
</section>