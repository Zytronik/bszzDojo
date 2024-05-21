<?php
$personalBests = getPersonalBests($conn, $userId);
?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Rekorde</h2>
				<?php if (empty($personalBests)) { ?>
					<p>Keine Rekorde vorhanden.</p>
				<?php }else{ ?>
					<div class="tabs">
						<?php $isFirst = true; ?>
						<?php foreach ($personalBests as $distance => $records): ?>
							<div class="tab <?php echo $isFirst ? 'active' : ''; ?>"
								data-tab-id="distance-<?php echo $distance; ?>">
								<?php echo $distance; ?>m
							</div>
							<?php $isFirst = false; ?>
						<?php endforeach; ?>
					</div>
					<?php $isFirst = true; ?>
					<?php foreach ($personalBests as $distance => $records): ?>
						<div class="tab-wrapper <?php echo $isFirst ? 'active' : ''; ?>" id="distance-<?php echo $distance; ?>">
							<?php foreach ($records as $record) {
								$rank = sanitizeOutput($record['rank']);
								$result = sanitizeOutput($record['result']);
								$bowType = sanitizeOutput($record['bowType']);
								$numberOfArrows = sanitizeOutput($record['numberOfArrows']);
								$createdAt = sanitizeOutput($record['createdAt']);
								$targetSize = sanitizeOutput($record['targetSize']);
								$isSpot = sanitizeOutput($record['isSpot']) ? ' Spot' : '';
								$tens = sanitizeOutput($record['tens']);
								$nines = sanitizeOutput($record['nines']);
								include "scoreRecord.php";
							} ?>
						</div>
						<?php $isFirst = false; ?>
					<?php endforeach; ?>
				<?php } ?>
			</div>
		</div>
	</div>
</section>