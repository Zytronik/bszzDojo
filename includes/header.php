<header>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<a href="index.php">
					<img src="img/logo_weiss.png" alt="BSZZ Dojo" class="logo white">
					<img src="img/logo.png" alt="BSZZ Dojo" class="logo">
				</a>
				<?php if (isset($_SESSION['username'])) { ?>
					<nav>
						<ul>
							<li class="submitScores"><a href="submitScores.php"><i class="fa-solid fa-circle-plus"></i></a></li>
							<li class="profile"><a href="profile.php?u=<?php echo urlencode($_SESSION['username']); ?>"><i
										class="fa-solid fa-user"></i></a></li>
							<li class="search"><a href="#"><i class="fa-solid fa-magnifying-glass"></i></a></li>
							<li class="settings"><a href="settings.php"><i class="fa-solid fa-cog"></i></a></li>
						</ul>
					</nav>
				<?php } ?>
			</div>
		</div>
	</div>
	<?php if (isset($_SESSION['username'])) {
		include 'includes/search.php';
	} ?>
</header>