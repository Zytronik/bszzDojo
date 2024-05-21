<?php include 'includes/sessionProtect.php'; 
include 'utils.php'; ?>
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
			<?php $title = "Willkommen, " . $_SESSION['username'];
			$desc = "Hier kannst du deine Leistungen im BSZZ Dojo eintragen und mit anderen vergleichen.";
			include 'includes/title.php'; ?>
			<?php include 'includes/allTimeRanking.php'; ?>
			<?php include 'includes/monthlyRanking.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>