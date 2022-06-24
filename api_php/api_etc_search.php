<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$resultSearch = array("typeSearch"=>"NONE", "search_user"=>array(), "search_event"=>array());

//POST variables
$typeSearch = isset($_POST['typeSearch'])? $_POST['typeSearch'] : "DEFAULT";
$resultSearch['typeSearch'] = $typeSearch;

$search_query = $_POST['search_query'];

try{
    
    $sql_search_user = "SELECT `idUser`, `username`, `avatar`, `address`, `lastName`, `firstName`, `verified` FROM ((`user` INNER JOIN `user_profile` ON `user`.`idUser`=`user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `user`.`idUser`=`user_verified`.`idUserFK`) WHERE `user`.`username` LIKE ? OR `user`.`username` LIKE ? OR `user`.`username` LIKE ?";
    $stmt1 = $connection->prepare($sql_search_user);

    $sql_search_event = $sql_select_most_like = "SELECT `idEvent`, `title`, `postMessage`, `location`, `dateTime`, `status`, `directorFK`, `postDateTime`, `username`, `idUser`,`avatar`, `address`, `verified` FROM (((`event`  INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `event`.`directorFK` = `user_profile`.`idUserFK`) INNER JOIN `user_verified` ON `event`.`directorFK` = `user_verified`.`idUserFK`)  WHERE `event`.`title` LIKE ? OR `event`.`title` LIKE ? OR `event`.`title` LIKE ? ORDER BY `postDateTime` DESC";
    $stmt2 = $connection->prepare($sql_search_event);

    $sql_select_Poster = "SELECT `linkToPoster` FROM `event_poster` WHERE `idEventFK` =?";
    $stmt3 = $connection->prepare($sql_select_Poster);

    $sql_select_price = "SELECT `price`, `currency`, `onlinePayment`, `offlinePayment` FROM `event_pricing` WHERE `idEventFK`=? ORDER BY `latestUpdate` DESC";
    $stmt4 = $connection->prepare($sql_select_price);

    if($typeSearch =="USER" || $typeSearch =="DEFAULT"){
        $query1 = $search_query."%";
        $query2 = "%".$search_query;
        $query3 = "%".$search_query."%";
        $stmt1->execute([$query1, $query2, $query3]);
        if($stmt1->rowCount()>0){
            $temp_user_arr = array();
            while($row_user = $stmt1->fetch()){
                array_push($temp_user_arr, array("idUser"=>$row_user['idUser'],
                                                 "username"=>$row_user['username'],
                                                 "avatar"=>$row_user['avatar'],
                                                 "firstName"=>$row_user['firstName'],
                                                 "lastName"=>$row_user['lastName'],
                                                 "verified"=>$row_user['verified']));
            }

            //Add array to API array
            $resultSearch['search_user'] = $temp_user_arr;
        }
    }

    if($typeSearch =="EVENT" || $typeSearch =="DEFAULT"){
        $query1 = $search_query."%";
        $query2 = "%".$search_query;
        $query3 = "%".$search_query."%";
        $stmt2->execute([$query1, $query2, $query3]);
        if($stmt2->rowCount()>0){
            $temp_event_arr = array();
            while($row_event = $stmt2->fetch()){
                $temp_event = array("idEvent"=>$row_event['idEvent'],
                                    "title"=>$row_event['title'],
                                    "postMessage"=>$row_event['postMessage'],
                                    "location"=>$row_event['location'],
                                    "dateTime"=>$row_event['dateTime'],
                                    "status"=>$row_event['status'],
                                    "directorFK"=>$row_event['directorFK'],
                                    "postDateTime"=>$row_event['postDateTime'],
                                    "username"=>$row_event['username'],
                                    "idUser"=>$row_event['idUser'],
                                    "avatar"=>$row_event['avatar'],
                                    "address"=>$row_event['address'],
                                    "verified"=>$row_event['verified'],
                                    "poster"=>"NONE",
                                    "price"=>"NONE");
                
                //Get event poster
                $stmt3->execute([$row_event['idEvent']]);
                if($stmt3->rowCount()>0){
                    $row_poster = $stmt3->fetch();
                    $temp_event['poster'] = $row_poster['linkToPoster'];
                }

                //Get event price
                $stmt4->execute([$row_event['idEvent']]);
                if($stmt4->rowCount()>0){
                    $row_price = $stmt4->fetch();
                    $temp_event['price']=$row_price['price']." ".$row_price['currency'];
                }

                //Add event to array
                array_push($temp_event_arr, $temp_event);

            }
            //Add to API array
            $resultSearch['search_event'] = $temp_event_arr;
        }

    }


}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}

//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $resultSearch));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);