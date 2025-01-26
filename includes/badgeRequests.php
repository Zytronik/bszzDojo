<?php $badgeRequests = getBadgeRequests($conn, 15); ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Anfragen</h2>
				<?php if (empty($badgeRequests)) { ?>
					<p>Keine Anfragen vorhanden.</p>
				<?php } else { ?>
					<?php foreach ($badgeRequests as $record) {
						$id = sanitizeOutput($record['id']);
						$createdAt = sanitizeOutput($record['createdAt']);
						$username = sanitizeOutput($record['username']);
						$name = sanitizeOutput($record['name']);
						$rank = sanitizeOutput($record['rank']);
						include "badgeRequestRecord.php";
					} ?>
				<?php } ?>
			</div>
		</div>
	</div>
</section>