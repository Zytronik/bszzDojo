<div class="medal-record-wrapper">
    <?php if($rank){ ?>
        <p class="rank">#<?php echo $rank; ?></p>
    <?php } ?>
    <div class="medal-record">
        <a href="profile.php?u=<?php echo urlencode($username); ?>" class="username"><?php echo $username; ?></a>
        <div class="medals">
            <div class="medal gold">
                <p><?php echo $first_place; ?></p>
            </div>
            <div class="medal silver">
                <p><?php echo $second_place; ?></p>
            </div>
            <div class="medal bronze">
                <p><?php echo $third_place; ?></p>
            </div>
        </div>
    </div>
</div>