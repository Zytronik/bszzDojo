<div class="lb-record-wrapper">
    <?php if($rank){ ?>
        <p class="rank">#<?php echo $rank; ?></p>
    <?php } ?>
    <div class="lb-record">
        <a href="profile.php?u=<?php echo urlencode($username); ?>" class="username"><?php echo $username; ?></a>
        <p class="results"><span><?php echo $result; ?></span> (<?php echo $resultOriginal; ?>) 10er: <span>x<?php echo $tens; ?></span> 9er: <span>x<?php echo $nines; ?></span></p>
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <p class="infos"><?php echo BOW_TYPES[$bowType]["name"]; ?>: (<?php echo $targetSize . "cm" . $isSpot; ?>)</p>
    </div>
</div>