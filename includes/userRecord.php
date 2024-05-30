<div class="user-record-wrapper" data-record-id="<?php echo $id; ?>">
    <div class="user-record">
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <p class="username"><?php echo $username ?></p>
    </div>
    <i class="fa-solid fa-delete-left delete-icon" data-id="<?php echo $id; ?>"></i>
</div>