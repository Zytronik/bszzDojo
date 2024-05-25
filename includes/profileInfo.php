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
						<p>Keiner</p>
					<?php } ?>
				</div>
				<div class="badges-wrapper">
					<p>Auszeichnungen:</p>
					<?php $badges = json_decode($user["badges"], true);
					if (!empty($badges)) { ?>
						<?php foreach ($badges as $badge) { ?>
							<div title='<?php echo BADGES[$badge]["name"]; ?>' class='badge <?php echo BADGES[$badge]["rank"]; ?>'>
								<?php echo BADGES[$badge]["abreviation"]; ?>
							</div>
						<?php } ?>
					<?php } else { ?>
						<p>Keine</p>
					<?php } ?>
				</div>
				<div class="stats-wrapper">
					<div>
						<p>Durchschnitt Punkte:</p>
						<p><?php echo getAverageScoreFromUser($conn, $user["id"]); ?></p>
					</div>
					<div>
						<p>Anzahl Scores:</p>
						<p><?php echo getTotalScoresFromUser($conn, $user["id"]); ?></p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>