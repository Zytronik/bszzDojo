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
					<?php foreach ($personalHistory as $record) {
							$id = sanitizeOutput($record['id']);
							$result = sanitizeOutput($record['result']);
							$bowType = sanitizeOutput($record['bowType']);
							$numberOfArrows = sanitizeOutput($record['numberOfArrows']);
							$createdAt = sanitizeOutput($record['createdAt']);
							$targetSize = sanitizeOutput($record['targetSize']);
							$isSpot = sanitizeOutput($record['isSpot']) ? ' Spot' : '';
							$tens = sanitizeOutput($record['tens']);
							$nines = sanitizeOutput($record['nines']);
							$rank = false;
							include "personalHistoryRecord.php";
					} ?>
				<?php } ?>
				<div id="deleteRecordModal" class="modal">
					<div class="modal-content">
						<span class="close">&times;</span>
						<p>Sind Sie sicher, dass Sie den Eintrag löschen möchten?</p>
						<button id="confirmDelete" data-delete-id="">Ja, löschen</button>
						<button id="cancelDelete">Abbrechen</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>