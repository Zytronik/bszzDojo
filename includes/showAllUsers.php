<?php $users = getUsers($conn); ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Alle Benutzer</h2>
				<?php if (empty($users)) { ?>
					<p>Keine Benutzer vorhanden.</p>
				<?php } else { ?>
					<?php foreach ($users as $record) {
						$id = sanitizeOutput($record['id']);
						$username = sanitizeOutput($record['username']);
						$createdAt = sanitizeOutput($record['createdAt']);
						include "userRecord.php";
					} ?>
				<?php } ?>
				<div id="deleteModal" class="modal">
					<div class="modal-content">
						<span class="close">&times;</span>
						<p>Sind Sie sicher, dass Sie den Benutzer löschen möchten?</p>
						<button id="confirmDelete" data-user-id="">Ja, löschen</button>
						<button id="cancelDelete">Abbrechen</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>