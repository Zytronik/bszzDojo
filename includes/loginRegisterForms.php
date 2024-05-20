<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<div class="tabs">
					<div class="tab <?php if(!isset($_POST['register'])) echo 'active'; ?>" data-tab-id="login">Login</div>
					<div class="tab <?php if(isset($_POST['register'])) echo 'active'; ?>" data-tab-id="register">Register</div>
				</div>
				<div class="tab-wrapper <?php if(!isset($_POST['register'])) echo 'active'; ?>" id="login">
					<?php include 'includes/login.php'; ?>
				</div>
				<div class="tab-wrapper <?php if(isset($_POST['register'])) echo 'active'; ?>" id="register">
					<?php include 'includes/register.php'; ?>
				</div>
			</div>
		</div>
	</div>
</section>