<?php session_start();
include 'utils.php'; ?>
<!DOCTYPE html>
<html lang="de">

<head>
	<title>BSZZ Dojo | Login</title>
	<?php include 'includes/head.php'; ?>
</head>

<body>
	<div id="loading-overlay"></div>
	<main>
		<?php include 'includes/header.php'; ?>
		<article>
			<section>
				<div class="container">
					<div class="row">
						<div class="col-md-12">
							<?php include 'includes/forgotPassword.php'; ?>
						</div>
					</div>
				</div>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>