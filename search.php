<?php include 'utils.php';

if (isset($_POST['query'])) {
    $query = $_POST['query'];
    $likeQuery = "%" . $query . "%";
    $searchResult = $conn->query("SELECT username FROM user WHERE username LIKE '" . dbSanitize($likeQuery) . "' LIMIT 10");

    if ($searchResult->num_rows > 0) {
        while ($row = $searchResult->fetch_assoc()) {
            $username = htmlspecialchars($row['username'], ENT_QUOTES, 'UTF-8');
            echo "<a href='profile.php?u=" . $username . "'>" . $username . "</a>";
        }
    } else {
        echo "<div>No results found</div>";
    }
}
