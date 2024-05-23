<div class="badge-record-wrapper" data-badge-record-id="<?php echo $id; ?>">
    <div class="badge-record">
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <p class="username"><?php echo $username ?></p>
        <p class="infos">Name: <span><?php echo $name; ?></span></p>
        <p>Platzierung: <span>#<?php echo $rank; ?></span></p>
    </div>
</div>