<div class="message <?php if (!isset($msg) || empty($msg))
    echo 'hidden '; if(isset($msg[0])) echo $msg[0]; ?>">
    <?php if (isset($msg[1]))
        echo $msg[1]; ?>
</div>