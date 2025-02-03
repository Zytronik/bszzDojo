<?php $medalRanking = getAllTimeMedalRankings($conn); ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Top 10 - Auszeichnungen</h2>
				<p class="lead">Die Schützen mit den meisten Auszeichnungen</p>
				<?php if (isset($medalRanking)) { ?>
					<?php foreach ($medalRanking as $record) {
						$rank = sanitizeOutput($record['rank']);
						$userId = sanitizeOutput($record['id']);
						$username = sanitizeOutput($record['username']);
						$first_place = sanitizeOutput($record['first_place']);
						$second_place = sanitizeOutput($record['second_place']);
						$third_place = sanitizeOutput($record['third_place']);
						include 'includes/recordMedalLeaderBoard.php';
					} ?>
				<?php } else { ?>
					<p>Keine Rekorde vorhanden.</p>
				<?php } ?>
			</div>
		</div>
	</div>
</section>