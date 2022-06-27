<?php
//Start session in this script
session_start();

//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryErrorAndStatus = array("query_error"=>"NONE", "user_found"=>0, "actor"=>"NOT_SELF", "is_user_online"=>0); //Just add the info of if user is found or not here for faster
$userProfileInfo = array();

//POST variables
$userId = isset($_POST['idUser'])? $_POST['idUser'] : 0;

//Determine actor
if(isset($_SESSION['idUser'])){
    $queryErrorAndStatus['is_user_online'] = 1;
    if($_SESSION['idUser'] == $userId){
        $queryErrorAndStatus['actor'] = "SELF";
    }  
}

try{
    //select fields
    //idUser, username, email, bio, address, firtName, lastName, verified, profilePicture, totalSubcribers, list of upcoming_events
    //Select basic unique key user info
    $sql_user_info ="SELECT `idUser`, `username`, `avatar`, `bio`, `firstName`, `lastName` FROM `user` INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK` WHERE `idUser`=?";
    $stmt_user_info = $connection->prepare($sql_user_info);

    //Select number of followers of user
    $sql_followers = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK`=?";
    $stmt_followers = $connection->prepare($sql_followers);

    //check if user is already follower
    $sql_already_follower = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK` =? AND `idFollowerFK` =?";
    $stmt_already_follower = $connection->prepare($sql_already_follower);

    //Select number of following by this user
    $sql_following = "SELECT `idUserFK` FROM `user_follower` WHERE `idFollowerFK` =?";
    $stmt_following = $connection->prepare($sql_following);

    //Select total of events by this user
    $sql_user_events = "SELECT `idEvent`, `title`, `location`, `dateTime`, `status`, `postDateTime` FROM `event` WHERE `directorFK` =? ORDER BY `dateTime` DESC";
    $stmt_user_events = $connection->prepare($sql_user_events);

    //Number of like for an event
    $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
    $stmt_event_like = $connection->prepare($sql_event_like);

    //user tickets
    $sql_user_ticket = "SELECT `idEvent`, `idTicketFK`, `price`, `currency`, `username`, `title`, `location`, `dateTime` FROM ((((`ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket`) INNER JOIN `user` ON `ticket_order`.`idAgentFK` = `user`.`idUser`) INNER JOIN `event_pricing` ON `ticket_order`.`idPriceFK` = `event_pricing`.`idPrice`) INNER JOIN `event` ON `event_ticket`.`idEventFK`=`event`.`idEvent`) WHERE `idCustomerFK`=? ORDER BY `orderDate` DESC";
    $stmt_user_ticket = $connection->prepare($sql_user_ticket);
    //$sql_user_ticket = "SELECT `idEvent`, `idTicketFK`, `ticketHash`, `price`, `currency`, `username`, `title`, `location`, `dateTime` FROM ((((`ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket`) INNER JOIN `user` ON `ticket_order`.`idAgentFK` = `user`.`idUser`) INNER JOIN `event_pricing` ON `ticket_order`.`idPriceFK` = `event_pricing`.`idPrice`) INNER JOIN `event` ON `event_ticket`.`idEventFK`=`event`.`idEvent`) WHERE `idCustomerFK`=? ORDER BY `orderDate` DESC";

    //Get poster link for event
    $sql_get_poster = "SELECT `linkToPoster` FROM `event_poster` WHERE `idEventFK` =? ORDER BY `dateUploaded` DESC LIMIT 1";
    $stmt_get_poster = $connection->prepare($sql_get_poster);

    $sql_select_price = "SELECT `price`, `currency`, `onlinePayment`, `offlinePayment` FROM `event_pricing` WHERE `idEventFK`=? ORDER BY `latestUpdate`";
    $stmt_price = $connection->prepare($sql_select_price);

    //Algorithm
    //1-execute sql_user_info 2- execute user followers, 3- execute user following 4-select all event from user, count_rows
    //send back variable SELF/NOT_SELF 
    //On user side if SELF display button edit and not follow
        //else (NOT_SELF) display follow and not edit (btn SHARE will always be displayed)
    
    //I will right a script for user ticket and user event that will be requested on tab clicked. 
    $stmt_user_info->execute([$userId]);
    if($stmt_user_info->rowCount()>0){
        //this user have info available
        $row_user_info = $stmt_user_info->fetch();
        $temp_arr_info = array("idUser"=>$row_user_info['idUser'],
                              "username"=>$row_user_info['username'],
                              "avatar"=>$row_user_info['avatar'],
                              "bio"=>$row_user_info['bio'],
                              "firstName"=>$row_user_info['firstName'],
                              "lastName"=>$row_user_info['lastName'],
                              "followers"=>0,
                              "following"=>0,
                              "events"=>0,
                              "arrEvent"=>array(),
                              "arrTicket"=>array(),
                              "alreadyFollower"=>0);
        
        //Get total followers
        $stmt_followers->execute([$userId]);
        $temp_arr_info['followers'] = $stmt_followers->rowCount();

        //Get total following
        $stmt_following->execute([$userId]);
        $temp_arr_info['following'] = $stmt_following->rowCount();

        //Total of event of user And list of events
        $stmt_user_events->execute([$userId]);
        $temp_arr_info['events'] = $stmt_user_events->rowCount();
        if($stmt_user_events->rowCount()>0){
            //Temporary array
            $temp_user_events = array();

            while($row_user_events = $stmt_user_events->fetch()){
                //Get event first poster
                $stmt_get_poster->execute([$row_user_events['idEvent']]);
                $event_poster_link = "NONE";
                if($stmt_get_poster->rowCount()>0){
                    $row_e_link = $stmt_get_poster->fetch();
                    $event_poster_link = $row_e_link['linkToPoster'];
                }

                //Get event price
                $stmt_price->execute([$row_user_events['idEvent']]);
                $event_price = "NONE";
                if($stmt_price->rowCount()>0){
                    $row_price = $stmt_price->fetch();
                    $event_price = $row_price['price']." ".$row_price['currency'];
                }

                array_push($temp_user_events, array("idEvent"=>$row_user_events['idEvent'],
                                                    "title"=>$row_user_events['title'],
                                                    "location"=>$row_user_events['location'],
                                                    "dateTime"=>$row_user_events['dateTime'],
                                                    "status"=>$row_user_events['status'],
                                                    "postDateTime"=>$row_user_events['postDateTime'],
                                                    "price"=>$event_price,
                                                    "posterLink"=>$event_poster_link));
            }
            $temp_arr_info['arrEvent'] = $temp_user_events;
        }

        if($queryErrorAndStatus['actor'] =="SELF"){
            //Get user tickets
            $stmt_user_ticket->execute([$userId]);
            if($stmt_user_ticket->rowCount()>0){
                //Temporary arr
                $temp_event_tickets = array();

                while($row_user_ticket = $stmt_user_ticket->fetch()){
                    $stmt_get_poster->execute([$row_user_ticket['idEvent']]);
                    $event_poster_link = "NONE";
                    if($stmt_get_poster->rowCount()>0){
                        $row_e_link = $stmt_get_poster->fetch();
                        $event_poster_link = $row_e_link['linkToPoster'];
                    }

                    array_push($temp_event_tickets, array("idEvent"=>$row_user_ticket['idEvent'],
                                                        "idTicketFK"=>$row_user_ticket['idTicketFK'],
                                                        "price"=>$row_user_ticket['price'],
                                                        "currency"=>$row_user_ticket['currency'],
                                                        "username"=>$row_user_ticket['username'],
                                                        "title"=>$row_user_ticket['title'],
                                                        "location"=>$row_user_ticket['location'],
                                                        "dateTime"=>$row_user_ticket['dateTime'],
                                                        "posterLink"=>$event_poster_link));
                }
                $temp_arr_info['arrTicket'] = $temp_event_tickets;
            }
        }

        if($queryErrorAndStatus['actor'] =="NOT_SELF" && isset($_SESSION['idUser'])){
            $stmt_already_follower->execute([$userId, $_SESSION['idUser']]);
            if($stmt_already_follower->rowCount()>0){
                $temp_arr_info['alreadyFollower'] =1;
            }
        }

        $queryErrorAndStatus['user_found'] =1;
        $userProfileInfo = $temp_arr_info;
    }
    

    
}catch(PDOException $e){
    $queryErrorAndStatus['query_error'] = $e->getMessage();
}



//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryErrorAndStatus, $userProfileInfo));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);