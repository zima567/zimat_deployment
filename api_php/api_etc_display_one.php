<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
//$APIResponse = array();
$APIResponse = array("arr_status"=>array(), "arr_event"=>array());
//$APIResponse = array_merge($APIResponse, $con_status);
//array_push($APIResponse, array()); // api_response[0] will contain status con, status query,

//Utilities variables
$queryError = array("query_error"=>"NONE");
$falseVar = 0;

//POST variables
$eventID = $_POST['idEvent'];

try{
    $sql_select_event = "SELECT `idEvent`, `title`, `postMessage`, `description`, `location`, `country`.`name` AS `location_country`, `cities`.`name` AS `location_city`, `dateTime`, `status`, `directorFK`, `username`, `avatar`, `firstName`, `lastName`, `address`, `bio` FROM ((((`event` INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `country` ON `event`.`location_country` = `country`.`idCountry`) INNER JOIN `cities` ON `event`.`location_city` = `cities`.`idCity`) WHERE `event`.`idEvent`=?";
    $stmt1 = $connection->prepare($sql_select_event);

    $sql_select_posters = "SELECT `linkToPoster` FROM `event_poster` WHERE `idEventFK`=?"; //many records
    $stmt2 = $connection->prepare($sql_select_posters);

    $sql_select_prices = "SELECT * FROM `event_pricing` WHERE `idEventFK`=? ORDER BY `latestUpdate` DESC"; //many records
    $stmt3 = $connection->prepare($sql_select_prices);

    $sql_event_categ = "SELECT `category`.`title` FROM `event_categ` INNER JOIN `category` ON `event_categ`.`idCategFK` = `category`.`idCategory` WHERE `idEventFK` =?";
    $stmt4 = $connection->prepare($sql_event_categ); //many records

    $sql_select_agent = "SELECT `idAgentFK`, `sellingRight`, `scanningRight`, `contact`, `location`, `username` FROM `event_agent` INNER JOIN `user` ON `event_agent`.`idAgentFK` = `user`.`idUser` WHERE `idEventFK`=?";
    $stmt5 = $connection->prepare($sql_select_agent); //many records

    $sql_available_ticket = "SELECT COUNT(`idTicket`) AS `availableTicket` FROM `event_ticket` WHERE `idEventFK`=? AND `sold`=?";
    $stmt6 = $connection->prepare($sql_available_ticket); //Return number of available ticket
     /*Remember to prevent access to agents info and available ticket to offline user */

     $sql_is_agent = "SELECT `idAgentFK` FROM `event_agent` WHERE `idAgentFK` =? AND `idEventFK` =?";
     $stmt7 = $connection->prepare($sql_is_agent);

    $stmt1->execute([$eventID]);
    if($stmt1->rowCount()>0){
        //This event exist
        $row_event_info = $stmt1->fetch();
        $temp_arr_event = array("idEvent"=>$row_event_info['idEvent'],
                                            "title"=>$row_event_info['title'],
                                            "postMessage"=>$row_event_info['postMessage'],
                                            "description"=>$row_event_info['description'],
                                            "location"=>$row_event_info['location'],
                                            "location_country"=>$row_event_info['location_country'],
                                            "location_city"=>$row_event_info['location_city'],
                                            "dateTime"=>$row_event_info['dateTime'],
                                            "status"=>$row_event_info['status'],
                                            "directorFK"=>$row_event_info['directorFK'],
                                            "username"=>$row_event_info['username'],
                                            "avatar"=>$row_event_info['avatar'],
                                            "firstName"=>$row_event_info['firstName'],
                                            "lastName"=>$row_event_info['lastName'],
                                            "address"=>$row_event_info['address'],
                                            "bio"=>$row_event_info['bio'],
                                            "linkPosters"=>array(),
                                            "prices"=>array(),
                                            "categories"=>array(),
                                            "agents"=>array(),
                                            "availableTicket"=>0,
                                            "isAgent"=>0,
                                            "isOnline"=>0);
        
        //Select posters
        $stmt2->execute([$eventID]);
        if($stmt2->rowCount()>0){
            $temp_arr_posters = array();
            while($row_posters = $stmt2->fetch()){
                array_push($temp_arr_posters, $row_posters['linkToPoster']);
            }
            $temp_arr_event['linkPosters'] = $temp_arr_posters;
        }

        //Select prices
        $stmt3->execute([$eventID]);
        if($stmt3->rowCount()>0){
            $temp_arr_prices = array();
            while($row_prices = $stmt3->fetch()){
                array_push($temp_arr_prices, array("price"=>$row_prices['price'],
                                                   "currency"=>$row_prices['currency'],
                                                    "onlinePayment"=>$row_prices['onlinePayment'],
                                                    "offlinePayment"=>$row_prices['offlinePayment']));
            }
            $temp_arr_event['prices'] = $temp_arr_prices;
        }

        //Select categories
        $stmt4->execute([$eventID]);
        if($stmt4->rowCount()>0){
            $temp_arr_categ = array(); 
            while($row_categ = $stmt4->fetch()){
                array_push($temp_arr_categ, $row_categ['title']);
            }
            $temp_arr_event['categories'] = $temp_arr_categ;
        }

        //If user is online send those informations
        if(isset($_SESSION['idUser'])){
            //user is online
            $temp_arr_event['isOnline'] = 1;
            //Select agents
            $stmt5->execute([$eventID]);
            if($stmt5->rowCount()>0){
                $temp_arr_agent = array();
                while($row_agents = $stmt5->fetch()){
                    array_push($temp_arr_agent, array("idAgentFK"=>$row_agents['idAgentFK'],
                                                    "sellingRight"=>$row_agents['sellingRight'],
                                                    "scanningRight"=>$row_agents['scanningRight'],
                                                    "contact"=>$row_agents['contact'],
                                                    "location"=>$row_agents['location'],
                                                    "username"=>$row_agents['username'])); 
                }
                $temp_arr_event['agents'] = $temp_arr_agent;
            }

            //available ticket
            $stmt6->execute([$eventID, $falseVar]);
            if($stmt6->rowCount()>0){
                $row_count_ticket_Available = $stmt6->fetch();
                $temp_arr_event['availableTicket'] = $row_count_ticket_Available['availableTicket'];
            }

            //Check if user is agent
            $stmt7->execute([$_SESSION['idUser'], $eventID]);
            if($stmt7->rowCount()>0){
                $temp_arr_event['isAgent'] = 1;
            }

        }

        //Add the complete info about this event into API
        $APIResponse['arr_event'] = $temp_arr_event;

    }
     else{
         //this event doesn't exist
     }



}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}


//Final merge
//Query error
$arr_status = array_merge($con_status, $queryError);
//$APIResponse = array("arr_status"=>array(), "arr_events_following"=>array(), "arr_event_related_categ"=>array(), "arr_event_default"=>array());
$APIResponse['arr_status'] = $arr_status;

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);