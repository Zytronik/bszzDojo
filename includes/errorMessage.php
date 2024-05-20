<div class="message error <?php if (!isset($errorMsg))
    echo 'hidden'; ?>">
    <?php if (isset($errorMsg))
        echo $errorMsg; ?>
</div>