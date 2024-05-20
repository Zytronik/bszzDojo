<?php include 'includes/sessionProtect.php'; ?>
<!DOCTYPE html>
<html lang="de">

<head>
	<title>BSZZ Dojo | Profile</title>
	<?php include 'includes/head.php'; ?>
</head>

<body>
	<div id="loading-overlay"></div>
	<main>
		<?php include 'includes/header.php'; ?>
		<article>
			<?php $title = "Profile";
			$desc = "Rekorde, Statistiken und mehr.";
			include 'includes/title.php'; ?>
			<?php include 'includes/profile.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>