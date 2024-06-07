<?php include 'utils.php';
include 'includes/sessionProtect.php'; ?>
<!DOCTYPE html>
<html lang="de">

<head>
	<title>BSZZ Dojo | Settings</title>
	<?php include 'includes/head.php'; ?>
</head>

<body>
	<div id="loading-overlay"></div>
	<main>
		<?php include 'includes/header.php'; ?>
		<article>
			<?php $title = "Einstellungen";
			$desc = "Konfiguriere dein BSZZ Dojo.";
			include 'includes/title.php'; 
			include 'includes/requestBadge.php';
			include 'includes/editProfile.php';
			include 'includes/settings.php';
			include 'includes/logout.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>