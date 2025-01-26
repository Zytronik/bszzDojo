<div class="user-record-wrapper" data-record-id="<?php echo $id; ?>">
    <div class="user-record">
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <a href="profile.php?u=<?php echo urlencode($username); ?>" class="username"><?php echo $username; ?></a>
    </div>
    <i class="fa-solid fa-delete-left delete-icon" data-id="<?php echo $id; ?>"></i>
</div>