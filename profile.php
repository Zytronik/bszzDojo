<?php include 'utils.php';
include 'includes/sessionProtect.php';
$user = getUserFromUrl($conn);
$userId = $user['id']; ?>
<!DOCTYPE html>
<html lang="de">

<head>
	<title>BSZZ Dojo | Profile</title>
	<?php include 'includes/head.php'; ?>
	<link rel="stylesheet" href="css/profile.css">
</head>

<body>
	<div id="loading-overlay"></div>
	<main>
		<?php include 'includes/header.php'; ?>
		<article>
			<?php include 'includes/profileInfo.php';
			include 'includes/personalRecords.php';
			include 'includes/personalCharts.php';
			include 'includes/personalHistory.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>