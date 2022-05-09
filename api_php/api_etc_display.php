<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
//$APIResponse = array();
$APIResponse = array("arr_status"=>array(), "arr_events_following"=>array(), "arr_event_related_categ"=>array(), "arr_my_event"=>array(), "arr_my_ticket"=>array(), "arr_event_default"=>array());
//$APIResponse = array_merge($APIResponse, $con_status);
//array_push($APIResponse, array()); // api_response[0] will contain status con, status query,

//Utilities variables
$queryError = array("query_error"=>"NONE", "user_online"=>0);

$arrEventsFollowing = array();
//array_push($arrEventsFollowing, array()); //[0] for return buffer
//$buffEventsFollowing = array(); // return buffer for evensFollowing

//User created event
$arrMyEvent = array();

//User tickets
$arrMyTicket = array();

$arrRelatedCateg = array();
//array_push($arrRelatedCateg, array());
//$buffRelatedCateg = array();

$arrDefaultEvents = array();
//array_push($arrDefaultEvents, array());
//$buffDefaultEvents = array();

//POST variables
$pastDateBorder = isset($_POST['pastLimit'])? $_POST['pastLimit']: "";
//$limitRow = $_POST['limitRow'];
//$numberOfSelectedRows =10;

//prepare date
$datePastLimit=date_create($pastDateBorder);
$datePastLimitFormated = date_format($datePastLimit,"Y-m-d H:i:s");

try{
    $sql_select_following = "SELECT `idUserFK` FROM `user_follower` WHERE `idFollowerFK` =?";
    $stmt1 = $connection->prepare($sql_select_following);

    $sql_select_all ="SELECT `idEvent`, `title`, `postMessage`, `location`, `dateTime`, `status`, `directorFK`, `postDateTime`, `username`, `idUser`,`avatar`, `address`, `verified` FROM ((((`event` INNER JOIN `user_follower` ON `event`.`directorFK`= `user_follower`.`idUserFK`) INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `event`.`directorFK` = `user_verified`.`idUserFK`)  WHERE `user_follower`.`idUserFK`=? AND `user_follower`.`idFollowerFK`=? AND `dateTime`>=? ORDER BY `postDateTime` DESC" ;
    $stmt2 = $connection->prepare($sql_select_all);

    $sql_select_most_like = "SELECT `idEvent`, `title`, `postMessage`, `location`, `dateTime`, `status`, `directorFK`, `postDateTime`, `username`, `idUser`,`avatar`, `address`, `verified` FROM (((`event`  INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `event`.`directorFK` = `user_verified`.`idUserFK`)  WHERE `dateTime`>=? ORDER BY `postDateTime` DESC";
    $stmt22 = $connection->prepare($sql_select_most_like);

    $sql_select_my_events ="SELECT `idEvent`, `title`, `postMessage`, `location`, `dateTime`, `status`, `directorFK`, `postDateTime`, `username`, `idUser`,`avatar`, `address`, `verified` FROM (((`event`  INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `event`.`directorFK` = `user_verified`.`idUserFK`)  WHERE `event`.`directorFK`= ? ORDER BY `postDateTime` DESC" ;
    $stmt222 = $connection->prepare($sql_select_my_events);

    $sql_select_my_tickets ="SELECT `idEvent`, `title`, `location`, `dateTime`, `status`, `directorFK`, `postDateTime`, `username`, `idUser`,`avatar`, `address`, `verified`, `idTicket`, `ticketHash`, `scanned`, `orderDate` FROM (((((`event`  INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `event`.`directorFK` = `user_verified`.`idUserFK`)INNER JOIN `event_ticket` ON `event`.`idEvent` = `event_ticket`.`idEventFK`) INNER JOIN `ticket_order` ON `event_ticket`.`idTicket` = `ticket_order`.`idTicketFK`)  WHERE `ticket_order`.`idCustomerFK`= ? ORDER BY `postDateTime` DESC" ;
    $stmt2222 = $connection->prepare($sql_select_my_tickets);

    $sql_select_Poster = "SELECT `linkToPoster` FROM `event_poster` WHERE `idEventFK` =?";
    $stmt3 = $connection->prepare($sql_select_Poster);

    $sql_select_price = "SELECT `price`, `currency`, `onlinePayment`, `offlinePayment` FROM `event_pricing` WHERE `idEventFK`=? ORDER BY `latestUpdate`";
    $stmt4 = $connection->prepare($sql_select_price);

    $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
    $stmt5 = $connection->prepare($sql_event_like);

    /**********************************FUNCTION DEFINITION SPACE --START--***********************************************/
    function getter_event_infos($stmt2, $stmt3, $stmt4, $stmt5, &$arrReturnHandler){
        if($stmt2->rowCount()>0){
            //this following has events
            //$queryError['query_error'] = "I am ready";//********************** */
            while($row2 = $stmt2->fetch()){
                //query the event into there temp array to be added to API array
                $temp_arr = array("idEvent"=>$row2['idEvent'],
                                                      "title"=>$row2['title'],
                                                      "postMessage"=>$row2['postMessage'],
                                                      "location"=>$row2['location'],
                                                      "dateTime"=>$row2['dateTime'],
                                                      "status"=>$row2['status'],
                                                      "directorFK"=>$row2['directorFK'],
                                                      "postDateTime"=>$row2['postDateTime'],
                                                      "username"=>$row2['username'],
                                                      "idUser"=>$row2['idUser'],
                                                      "avatar"=>$row2['avatar'],
                                                      "address"=>$row2['address'],
                                                      "verified"=>$row2['verified'],
                                                      "posters"=>array(),
                                                      "prices"=>array(),
                                                      "nbrLike"=>0,
                                                      "userLiked"=>0);
                $stmt3->execute([$row2['idEvent']]);
                $posterTemp = array();
                if($stmt3->rowCount()>0){
                    //Event has posters
                    while($row3 = $stmt3->fetch()){
                        array_push($posterTemp, $row3['linkToPoster']);
                    }
                    $temp_arr['posters'] = $posterTemp;
                }


                $stmt4->execute([$row2['idEvent']]);
                if($stmt4->rowCount()>0){
                    //event prices set
                    $priceTemp = array();
                    while($row4 = $stmt4->fetch()){
                        array_push($priceTemp, $row4['price']." ".$row4['currency']);
                    }
                    $temp_arr['prices'] = $priceTemp;
                }

                //Get the number of like for that event

                 $stmt5->execute([$row2['idEvent']]);
                if($stmt5->rowCount()>0){
                    $temp_arr['nbrLike'] = $stmt5->rowCount();
            
                    if(isset($_SESSION['idUser'])){
                        $userLiked=0;
                        while($row_likes = $stmt5->fetch()){
                            if($row_likes['idLikerFK']==$_SESSION['idUser']){
                                $userLiked = 1;
                            }
                        }
                        if($userLiked){
                            $temp_arr['userLiked'] =1;
                        }
                    }

                }

                //Add this event infos to upper array closer to main Array Api
               //return $temp_arr; 
               array_push($arrReturnHandler, $temp_arr); 
            }
        }
        else{
            //this following hasn't posted events
            return $arrReturnHandler;
        }

        //Return array with result content
        return $arrReturnHandler;
    }

    function getter_ticket_infos($stmt2222, $stmt3, $stmt4, &$arrReturnHandler){
        if($stmt2222->rowCount()>0){
            //this following has events
            //$queryError['query_error'] = "I am ready";//********************** */
            while($row2 = $stmt2222->fetch()){
                //query the event into there temp array to be added to API array
                $temp_arr = array("idEvent"=>$row2['idEvent'],
                                                      "title"=>$row2['title'],
                                                      "location"=>$row2['location'],
                                                      "dateTime"=>$row2['dateTime'],
                                                      "status"=>$row2['status'],
                                                      "directorFK"=>$row2['directorFK'],
                                                      "postDateTime"=>$row2['postDateTime'],
                                                      "username"=>$row2['username'],
                                                      "idUser"=>$row2['idUser'],
                                                      "avatar"=>$row2['avatar'],
                                                      "address"=>$row2['address'],
                                                      "verified"=>$row2['verified'],
                                                      "idTicket"=>$row2['idTicket'],
                                                      "ticketHash"=>$row2['ticketHash'],
                                                      "scanned"=>$row2['scanned'],
                                                      "orderDate"=>$row2['orderDate'],
                                                      "posters"=>array(),
                                                      "prices"=>array());
                $stmt3->execute([$row2['idEvent']]);
                $posterTemp = array();
                if($stmt3->rowCount()>0){
                    //Event has posters
                    while($row3 = $stmt3->fetch()){
                        array_push($posterTemp, $row3['linkToPoster']);
                    }
                    $temp_arr['posters'] = $posterTemp;
                }


                $stmt4->execute([$row2['idEvent']]);
                if($stmt4->rowCount()>0){
                    //event prices set
                    $priceTemp = array();
                    while($row4 = $stmt4->fetch()){
                        array_push($priceTemp, $row4['price']." ".$row4['currency']);
                    }
                    $temp_arr['prices'] = $priceTemp;
                }

                //Add this event infos to upper array closer to main Array Api
               //return $temp_arr; 
               array_push($arrReturnHandler, $temp_arr); 
            }
        }
        else{
            //this following hasn't posted events
            return $arrReturnHandler;
        }

        //Return array with result content
        return $arrReturnHandler;
    }


/**********************************FUNCTION DEFINITION SPACE --END--***********************************************/
    
    if(isset($_SESSION['idUser']) && !isset($_POST['myEvent']) && !isset($_POST['myTicket'])){
        //user is online, query the event base on following
        $queryError['user_online']=1;
        $idUserOnline = $_SESSION['idUser'];
        
        $stmt1->execute([$idUserOnline]);
        if($stmt1->rowCount()>0){
            //User is following other people
            
            while($row1 = $stmt1->fetch()){
                //$queryError['query_error'] = $datePastLimitFormated."vvvvvvvvvvv";//********************** */
                //Query events related to that following
                $stmt2->execute([$row1['idUserFK'], $idUserOnline, $datePastLimitFormated]);
                //Here we will call the function
                //array_push($arrEventsFollowing, getter_event_infos($stmt2, $stmt3, $stmt4, $stmt5));
                $arrEventsFollowing = getter_event_infos($stmt2, $stmt3, $stmt4, $stmt5, $arrEventsFollowing);
        
            }
        }
        else{
            //user is not following people
            $queryError['query_error'] = "User is not following people";
        }
    }
    elseif(isset($_SESSION['idUser']) && isset($_POST['myEvent'])){
        //Query event created by the user online
        $idUserOnline = $_SESSION['idUser'];
        $stmt222->execute([$idUserOnline]);
        $arrMyEvent = getter_event_infos($stmt222,$stmt3, $stmt4, $stmt5, $arrMyEvent);
    }
    elseif(isset($_SESSION['idUser']) && isset($_POST['myTicket'])){
        $queryError['user_online']=1;
        $idUserOnline = $_SESSION['idUser'];
        $stmt2222->execute([$idUserOnline]);
        $arrMyTicket = getter_ticket_infos($stmt2222,$stmt3, $stmt4, $arrMyTicket);

    }
    elseif(!isset($_SESSION['idUser']) && !isset($_POST['myEvent'])){
        //user is offline query default event
        $queryError['query_error'] = "User is offline once again";
        $stmt22->execute([$datePastLimitFormated]);
        $arrDefaultEvents = getter_event_infos($stmt22, $stmt3, $stmt4, $stmt5, $arrDefaultEvents);
    }
    else{
        $queryError['query_error'] = "Request not Handle"; 
    }

}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}


//Final merge
//Query error
$arr_status = array_merge($con_status, $queryError);
//$APIResponse = array("arr_status"=>array(), "arr_events_following"=>array(), "arr_event_related_categ"=>array(), "arr_event_default"=>array());
$APIResponse['arr_status'] = $arr_status;

if(isset($_POST['myEvent'])){
    $APIResponse['arr_my_event'] = $arrMyEvent;
}
elseif(isset($_POST['myTicket'])){
    $APIResponse['arr_my_ticket'] = $arrMyTicket;
}
else{
    $APIResponse['arr_events_following'] = $arrEventsFollowing;
    $APIResponse['arr_event_default'] = $arrDefaultEvents;
}

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);