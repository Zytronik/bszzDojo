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
			</div>
		</div>
	</div>
</section>