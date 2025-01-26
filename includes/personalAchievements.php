<?php
$badges = json_decode($user["badges"], true);
?>
<?php if (!empty($badges)) { ?>
<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>Auszeichnungen</h2>
				<?php foreach ($badges as $badge) {  
					$badge = json_decode($badge, true);
					$name = $badge["badgeName"];
					$year = $badge["year"];
					$rank = $badge["rank"];
					include "badgeRecord.php";
				} ?>
			</div>
		</div>
	</div>
</section>
<?php } ?>