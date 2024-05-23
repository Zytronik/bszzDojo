<div class="user-record-wrapper" data-user-record-id="<?php echo $id; ?>">
    <div class="user-record">
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <p class="username"><?php echo $username ?></p>
    </div>
    <i class="fa-solid fa-delete-left delete-icon" data-user-id="<?php echo $id; ?>"></i>
</div>