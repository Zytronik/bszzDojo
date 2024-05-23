<div class="record-wrapper">
    <?php if ($rank) { ?>
        <p class="rank">#<?php echo $rank; ?></p>
    <?php } ?>
    <div class="record">
        <p class="date"><?php echo formatDate($createdAt); ?></p>
        <p class="infos"><?php echo BOW_TYPES[$bowType]["name"]; ?>: <?php echo $numberOfArrows; ?> Pfeile
            (<?php echo $targetSize . "cm" . $isSpot; ?>)</p>
        <p class="results"><span><?php echo $result; ?></span> 10er: <span>x<?php echo $tens; ?></span> 9er:
            <span>x<?php echo $nines; ?></span>
        </p>
    </div>
</div>