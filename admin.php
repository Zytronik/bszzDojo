<?php include 'utils.php';
include 'includes/sessionProtect.php';

if ($_SESSION['role'] != "admin") {
	header("Location: index.php");
	exit();
} ?>
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
			<?php $title = "Admin";
			$desc = "Verwalte das BSZZ Dojo.";
			include 'includes/title.php';
			include 'includes/badgeRequests.php';
			include 'includes/adminEdit.php';
			include 'includes/showAllUsers.php'; ?>
		</article>
		<?php include 'includes/footer.php'; ?>
	</main>
</body>

</html>