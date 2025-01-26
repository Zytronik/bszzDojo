<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h1><?php echo $user["username"]; ?></h1>
				<div class="rank-wrapper">
					<p>Abzeichen:</p>
					<?php if (isset($user["rank"]) && isset(RANKS[$user["rank"]])) { ?>
						<div title='<?php echo RANKS[$user["rank"]]["name"]; ?>'
							style='background-color: <?php echo RANKS[$user["rank"]]["color"]; ?>;' class="rank">
							<img src="img/ranks/<?php echo RANKS[$user["rank"]]["imgUrl"]; ?>" alt="Rank">
						</div>
					<?php } else { ?>
						<p>Keines</p>
					<?php } ?>
				</div>
				<div class="stats-wrapper">
					<div>
						<p>Punkte Durchschnitt:</p>
						<p><?php echo getAverageScoreFromUser($conn, $user["id"]); ?></p>
					</div>
					<div>
						<p>Anzahl Scores:</p>
						<p><?php echo getTotalScoresFromUser($conn, $user["id"]); ?></p>
					</div>
					<?php $badges = json_decode($user["badges"], true); ?>
					<?php if (!empty($badges)) { ?>
						<div>
							<p>Anzahl Auszeichnungen:</p>
							<p><?php echo count($badges); ?></p>
						</div>
					<?php } ?>
				</div>
			</div>
		</div>
	</div>
</section>