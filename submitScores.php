<?php include 'utils.php';
include 'includes/sessionProtect.php'; ?>
<!DOCTYPE html>
<html lang="de">

<head>
	<title>BSZZ Dojo | Dashboard</title>
	<?php include 'includes/head.php'; ?>
</head>

<body>
	<div id="loading-overlay"></div>
	<main>
		<?php include 'includes/header.php'; ?>
		<article>
		<?php $title = "Score erfassen";
			$desc = "Trage hier deine Leistungen im BSZZ Dojo ein.";
			include 'includes/title.php'; ?>
			<?php include 'includes/submitScore.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>