<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<?php include 'infoMessage.php'; ?>
				<h2>Abzeichen bearbeiten</h2>
				<div class="tabs">
					<div class="tab <?php if(!isset($_POST['giveBadge']) && !isset($_POST["removeBadge"])) echo 'active'; ?>" data-tab-id="rank">Rang</div>
					<div class="tab <?php if(isset($_POST['giveBadge']) || isset($_POST["removeBadge"])) echo 'active'; ?>" data-tab-id="badge">Auszeichnung</div>
				</div>
				<div class="tab-wrapper <?php if(!isset($_POST['giveBadge']) && !isset($_POST["removeBadge"])) echo 'active'; ?>" id="rank">
					<?php include 'includes/editRank.php'; ?>
				</div>
				<div class="tab-wrapper <?php if(isset($_POST['giveBadge']) || isset($_POST["removeBadge"])) echo 'active'; ?>" id="badge">
					<?php include 'includes/editBadge.php'; ?>
				</div>
			</div>
		</div>
	</div>
</section>