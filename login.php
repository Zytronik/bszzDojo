<?php session_start(); ?>
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
			<?php $title = "Willkommen im <br> BSZZ Dojo";
			$desc = "Bitte logge dich ein oder registriere dich, um das BSZZ Dojo zu betreten.";
			include 'includes/title.php'; ?>
			<?php include 'includes/loginRegisterForms.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>