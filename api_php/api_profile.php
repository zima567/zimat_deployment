<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE", "user_found"=>0); //Just add the info of if user is found or not here for faster
$userProfileInfo = array();
$actor ="NOT_SELF";//SELF, NOT_SELF

//POST variables
$userId = isset($_POST['idUser'])? $_POST['idUser'] : 0;

//Determine actor
if(isset($_SESSION['idUser']) && $_SESSION['idUser'] == $userId){
    $actor = "SELF";
}

try{
    //select fields
    //idUser, username, email, bio, address, firtName, lastName, verified, profilePicture, totalSubcribers, list of upcoming_events
    //Select basic unique key user info
    $sql_user_info ="SELECT `username`, `avatar`, `bio` FROM `user` INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK` WHERE `idUser`=?";
    $stmt_user_info = $connection->prepare($sql_user_info);

    //Select number of followers of user
    $sql_followers = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK`=?";
    $stmt_followers = $connection->prepare($sql_followers);

    //Select number of following by this user
    $sql_following = "SELECT `idUserFK` FROM `user_follower` WHERE `idFollowerFK` =?";
    $stmt_following = $connection->prepare($sql_following);

    //Select total of events by this user
    $sql_user_events = "SELECT `idEvent`, `title`, `postMessage`, `location`, `dateTime`, `status`, `postDateTime` FROM `event` WHERE `directorFK` =? ORDER BY `dateTime` DESC";
    $stmt_user_events = $connection->prepare($sql_user_events);

    //Number of like for an event
    $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
    $stmt_event_like = $connection->prepare($sql_event_like);

    //user tickets
    $sql_user_ticket = "SELECT `idTicketFK`, `ticketHash`, `price`, `currency`, `username`, `title`, `location`, `dateTime` FROM ((((`ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket`) INNER JOIN `user` ON `ticket_order`.`idAgentFK` = `user`.`idUser`) INNER JOIN `event_pricing` ON `ticket_order`.`idPriceFK` = `event_pricing`.`idPrice`) INNER JOIN `event` ON `event_ticket`.`idEventFK`=`event`.`idEvent`) WHERE `idCustomerFK`=? ORDER BY `orderDate` DESC";
    $stmt_user_ticket = $connection->prepare($sql_user_ticket);

    //Get poster link for event
    $sql_get_poster = "SELECT `linkToPoster` FROM `event_poster` WHERE `idEventFK` =? ORDER BY `dateUploaded` DESC LIMIT 1";
    $stmt_get_poster = $connection->prepare($sql_get_poster);

    //Algorithm
    //1-execute sql_user_info 2- execute user followers, 3- execute user following 4-select all event from user, count_rows
    //send back variable SELF/NOT_SELF 
    //On user side if SELF display button edit and not follow
        //else (NOT_SELF) display follow and not edit (btn SHARE will always be displayed)
    
    //I will right a script for user ticket and user event that will be requested on tab clicked. 

    
}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}



//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $userProfileInfo));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);