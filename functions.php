<?php if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header("Location: index.php");
    exit();
}
function getCurrentMonthName()
{
    $months = [
        1 => 'Januar',
        2 => 'Februar',
        3 => 'März',
        4 => 'April',
        5 => 'Mai',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'August',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Dezember'
    ];

    $currentMonthNumber = (int) date('n');
    $currentMonthName = $months[$currentMonthNumber];

    echo $currentMonthName;
}
function usernameExists($conn, $username)
{
    $user = $conn->query("SELECT id FROM user WHERE username = '" . $username . "'");
    return $user->num_rows > 0;
}

function emailExists($conn, $email)
{
    $user = $conn->query("SELECT id FROM user WHERE email = '" . $email . "'");
    return $user->num_rows > 0;
}

function registerUser($conn, $username, $password, $email)
{
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $insertCredentials = "INSERT INTO user (username, passwordHash, email) VALUES ('" . dbSanitize($username) . "', '" . dbSanitize($password_hash) . "', '" . dbSanitize($email) . "')";
    if ($conn->query($insertCredentials)) {
        return loginUser($conn, $username, $password);
    } else {
        return ["error", "Es ist ein Fehler aufgetreten."];
    }
}

function loginUser($conn, $username, $password)
{
    $credentials = $conn->query("SELECT id, passwordHash FROM user WHERE username = '" . $username . "'");
    if ($credentials->num_rows > 0) {
        $users = $credentials->fetch_assoc();
        $id = $users['id'];
        $password_hash = $users['passwordHash'];
        if (password_verify($password, $password_hash)) {
            $_SESSION['user_id'] = sanitizeOutput($id);
            $_SESSION['username'] = sanitizeOutput($username);
            header("Location: index.php");
            exit();
        } else {
            return ["error", "Ungültiges Passwort."];
        }
    } else {
        return ["error", "Es wurde kein Benutzer mit diesem Benutzernamen gefunden."];
    }
}

function submitScore($conn, $userId, $bowType, $targetSize, $distance, $isSpot, $tens, $nines, $result, $arrows)
{
    $insertScore = "INSERT INTO score (userId, bowType, targetSize, distance, isSpot, tens, nines, result, numberOfArrows) VALUES ('
    " . dbSanitize($userId) . "',
    '" . dbSanitize($bowType) . "',
    '" . dbSanitize($targetSize) . "',
    '" . dbSanitize($distance) . "',
    '" . dbSanitize($isSpot) . "',
    '" . dbSanitize($tens) . "',
    '" . dbSanitize($nines) . "',
    '" . dbSanitize($result) . "',
    '" . dbSanitize($arrows) . "')";
    if ($conn->query($insertScore)) {
        return ["success", "Score erfolgreich eingetragen."];
    } else {
        return ["error", "Es ist ein Fehler aufgetreten."];
    }
}

function dbSanitize($input)
{
    $input = trim($input);
    $input = addslashes($input);
    return $input;
}

function sanitizeOutput($input)
{
    return htmlspecialchars($input);
}

function getPersonalBests($conn, $userId)
{
    $sql = "
            SELECT *
            FROM (
                SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY distance ORDER BY result DESC) AS rank
                FROM score
                WHERE userId = '" . $userId . "'
            ) ranked
            WHERE rank <= 3
        ";

    $personalBests = $conn->query($sql);
    if ($personalBests->num_rows > 0) {
        $pb = $personalBests->fetch_all(MYSQLI_ASSOC);
        $sortedResults = [];
        foreach ($pb as $record) {
            $distance = $record['distance'];
            if (!isset($sortedResults[$distance])) {
                $sortedResults[$distance] = [];
            }
            $sortedResults[$distance][] = $record;
        }
        return $sortedResults;
    }
    return [];
}

function dump(...$variables)
{
    foreach ($variables as $variable) {
        echo gettype($variable) . '<br>';
        echo '<pre>';
        print_r($variable);
        echo '</pre>';
    }
}

function formatDate($timestamp, $format = 'l, d F Y')
{
    $date = new DateTime($timestamp);
    $germanWeekdays = [
        'Monday' => 'Montag',
        'Tuesday' => 'Dienstag',
        'Wednesday' => 'Mittwoch',
        'Thursday' => 'Donnerstag',
        'Friday' => 'Freitag',
        'Saturday' => 'Samstag',
        'Sunday' => 'Sonntag'
    ];
    $germanMonths = [
        'January' => 'Januar',
        'February' => 'Februar',
        'March' => 'März',
        'April' => 'April',
        'May' => 'Mai',
        'June' => 'Juni',
        'July' => 'Juli',
        'August' => 'August',
        'September' => 'September',
        'October' => 'Oktober',
        'November' => 'November',
        'December' => 'Dezember'
    ];

    $englishWeekday = $date->format('l');
    $englishMonth = $date->format('F');

    $germanWeekday = $germanWeekdays[$englishWeekday];
    $germanMonth = $germanMonths[$englishMonth];

    $formattedDate = $date->format($format);
    $formattedDate = str_replace($englishWeekday, $germanWeekday, $formattedDate);
    $formattedDate = str_replace($englishMonth, $germanMonth, $formattedDate);

    return $formattedDate;
}


function getPersonalHistory($conn, $userId, $limit = 0, $order = 'DESC')
{
    $limitQuery = "";
    if ($limit && $limit > 0) {
        $limitQuery = "LIMIT " . $limit;
    }

    $sql = "
            SELECT *
            FROM score
            WHERE userId = '" . $userId . "'
            ORDER BY createdAt " . $order . "
            " . $limitQuery . "
        ";

    $personalHistory = $conn->query($sql);
    if ($personalHistory->num_rows > 0) {
        return $personalHistory->fetch_all(MYSQLI_ASSOC);
    }
    return [];
}

function getChartData($conn, $userId)
{
    $history = getPersonalHistory($conn, $userId, 0, "ASC");
    if (empty($history)) {
        return [];
    }

    $sortedResults = [];
    foreach ($history as $record) {
        $record['createdAt'] = formatDate($record['createdAt']);
        $distance = $record['distance'];
        if (!isset($sortedResults[$distance])) {
            $sortedResults[$distance] = [];
        }
        $sortedResults[$distance][] = $record;
    }

    ksort($sortedResults, SORT_NUMERIC);

    return $sortedResults;
}


function getUsernameFromURL()
{
    return isset($_GET['u']) ? $_GET['u'] : '';
}

function getUserByUsername($conn, $username)
{
    $user = $conn->query("SELECT * FROM user WHERE username = '" . $username . "'");
    if ($user->num_rows > 0) {
        return $user->fetch_assoc();
    }
    return [];
}

function getUserFromUrl($conn)
{
    $username = getUsernameFromURL();
    if (!usernameExists($conn, $username)) {
        header("Location: index.php");
        exit();
    }
    return getUserByUsername($conn, $username);
}

function getAllTimeRankings($conn)
{
    $sql = "
        SELECT 
            s1.userId,
            u.username,
            s1.distance,
            s1.result,
            s1.bowType,
            s1.createdAt,
            s1.targetSize,
            s1.isSpot,
            s1.tens,
            s1.nines,
            RANK() OVER (PARTITION BY s1.distance ORDER BY s1.result DESC) as rank
        FROM 
            score s1
        INNER JOIN 
            user u ON s1.userId = u.id
        INNER JOIN 
            (
                SELECT 
                    userId, 
                    distance, 
                    MAX(result) as max_result
                FROM 
                    score
                WHERE 
                    distance IN (8, 18)
                    AND numberOfArrows = 30
                GROUP BY 
                    userId, distance
            ) s2 
            ON 
                s1.userId = s2.userId 
                AND s1.distance = s2.distance 
                AND s1.result = s2.max_result
        WHERE 
            s1.distance IN (8, 18)
            AND s1.numberOfArrows = 30
        ORDER BY 
            s1.result DESC, s1.createdAt ASC
    ";

    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $bestScores = $result->fetch_all(MYSQLI_ASSOC);
        $sortedResults = [];
        foreach ($bestScores as $record) {
            $record['resultOriginal'] = $record['result'];
            $record['result'] = floor($record['result'] * BOW_TYPES[$record['bowType']]['factor']);
            $distance = $record['distance'];
            if (!isset($sortedResults[$distance])) {
                $sortedResults[$distance] = [];
            }
            if (count($sortedResults[$distance]) < 10) {
                $sortedResults[$distance][] = $record;
            }
        }
        return $sortedResults;
    }
    return [];
}

function getMonthlyRankings($conn)
{
    $currentYear = date('Y');
    $currentMonth = date('m');

    $sql = "
        SELECT 
            s1.userId,
            u.username,
            s1.distance,
            s1.result,
            s1.bowType,
            s1.createdAt,
            s1.targetSize,
            s1.isSpot,
            s1.tens,
            s1.nines,
            RANK() OVER (PARTITION BY s1.distance ORDER BY s1.result DESC) as rank
        FROM 
            score s1
        INNER JOIN 
            user u ON s1.userId = u.id
        INNER JOIN 
            (
                SELECT 
                    userId, 
                    distance, 
                    MAX(result) as max_result
                FROM 
                    score
                WHERE 
                    distance IN (8, 18)
                    AND numberOfArrows = 30
                    AND YEAR(createdAt) = '$currentYear'
                    AND MONTH(createdAt) = '$currentMonth'
                GROUP BY 
                    userId, distance
            ) s2 
            ON 
                s1.userId = s2.userId 
                AND s1.distance = s2.distance 
                AND s1.result = s2.max_result
        WHERE 
            s1.distance IN (8, 18)
            AND s1.numberOfArrows = 30
            AND YEAR(s1.createdAt) = '$currentYear'
            AND MONTH(s1.createdAt) = '$currentMonth'
        ORDER BY 
            s1.result DESC, s1.createdAt ASC
    ";

    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $bestScores = $result->fetch_all(MYSQLI_ASSOC);
        $sortedResults = [];
        foreach ($bestScores as $record) {
            $record['resultOriginal'] = $record['result'];
            $record['result'] = floor($record['result'] * BOW_TYPES[$record['bowType']]['factor']);
            $distance = $record['distance'];
            if (!isset($sortedResults[$distance])) {
                $sortedResults[$distance] = [];
            }
            if (count($sortedResults[$distance]) < 10) {
                $sortedResults[$distance][] = $record;
            }
        }
        return $sortedResults;
    }
    return [];
}

function getUserById($conn, $userId)
{
    $user = $conn->query("SELECT * FROM user WHERE id = '" . $userId . "'");
    if ($user->num_rows > 0) {
        return $user->fetch_assoc();
    }
    return [];
}

function editProfile($conn, $username, $email, $password, $userId)
{
    $fields = [];

    if (!empty($username)) {
        $fields[] = "username = '" . dbSanitize($username) . "'";
    }

    if (!empty($email)) {
        $fields[] = "email = '" . dbSanitize($email) . "'";
    }

    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $fields[] = "passwordHash = '" . dbSanitize($hashedPassword) . "'";
    }

    if (empty($fields)) {
        return ["success", "Profil erfolgreich aktualisiert."];
    }

    $sql = "UPDATE user SET " . implode(", ", $fields) . " WHERE id = '" . $userId . "'";


    if ($conn->query($sql) === TRUE) {
        return ["success", "Profil erfolgreich aktualisiert."];
    } else {
        return ["error", "Es ist ein Fehler aufgetreten."];
    }
}

function requestBadge($conn, $userId, $badgeName, $badgeRank)
{
    $insertRequest = "INSERT INTO request (userId, name, rank) VALUES ('" . $userId . "', '" . dbSanitize($badgeName) . "', '" . dbSanitize($badgeRank) . "')";
    if ($conn->query($insertRequest)) {
        return ["success", "Anfrage erfolgreich eingereicht."];
    } else {
        return ["error", "Es ist ein Fehler aufgetreten."];
    }
}

function getTotalScoresFromUser($conn, $userId){
    $sql = "SELECT COUNT(*) as totalScores FROM score WHERE userId = '" . $userId . "'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $totalScores = $result->fetch_assoc();
        return $totalScores["totalScores"];
    }
    return 0;
}

function getAverageScoreFromUser($conn, $userId){
    $sql = "SELECT AVG(result / numberOfArrows) as averageScore FROM score WHERE userId = '" . $userId . "'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $averageScore = $result->fetch_assoc();
        return round($averageScore["averageScore"], 2);
    }
    return 0.00;
}