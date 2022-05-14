<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);
//array_push($APIResponse, array()); // api_response[0] will contain status con, status query,

//Utilities variables
$queryError = array("query_error"=>"NONE");
$actionResult = array("status"=>0, "actionType"=>"NONE", "total"=>0, "action_error"=>"NONE");
$errorMsg="";

//Post variables
//below inside conditions

if(isset($_SESSION['idUser']) && isset($_POST['actionType'])){
    //post variables here...
    $actionType = $_POST['actionType'];
    $actionDateTime = isset($_POST['actionDateTime'])? $_POST['actionDateTime'] : "0000-00-00 00:00:00";

    try{

        $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_event_like = $connection->prepare($sql_event_like);

        $sql_add_event_like = "INSERT INTO `event_like` (`idEventFK`, `idLikerFK`, `likeDate`) VALUES(?,?,?)";
        $stmt_add_event_like = $connection->prepare($sql_add_event_like);

        $sql_remove_event_like = "DELETE FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_remove_event_like = $connection->prepare($sql_remove_event_like);

        $sql_all_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
        $stmt_all_like = $connection->prepare($sql_all_like);

        $sql_is_follower = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK` =? AND `idFollowerFK` =?";
        $stmt_is_follower = $connection->prepare($sql_is_follower);

        $sql_set_follower = "INSERT INTO `user_follower`(`idUserFK`, `idFollowerFK`, `followDate`) VALUES(?,?,?)";
        $stmt_set_follower = $connection->prepare($sql_set_follower);

        $sql_remove_follower = "DELETE FROM `user_follower` WHERE `idUserFK` =? AND `idFollowerFK` =?";
        $stmt_remove_follower = $connection->prepare($sql_remove_follower);

        $sql_all_follower = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK` =?";
        $stmt_all_follower = $connection->prepare($sql_all_follower);


        if($actionType=="EVENT_LIKE" && isset($_POST['eventID'])){
            $eventID = $_POST['eventID'];
            //Handle like for event
            $actionResult['actionType'] = "EVENT_LIKE";
            //Test if user already like event
            $stmt_event_like->execute([$eventID, $_SESSION['idUser']]);
            if(!$stmt_event_like->rowCount()>0){
                //User haven't liked event yet
                $stmt_add_event_like->execute([$eventID, $_SESSION['idUser'], $actionDateTime]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 1;
            }
            else{
                //user have already liked this event
                //Automatically the unlike query will be executed
                $stmt_remove_event_like->execute([$eventID, $_SESSION['idUser']]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 2;
            }
        }
        elseif($actionType=="FOLLOW_UNFOLLOW" && isset($_POST['user_to_follow_unfollow'])){
            //Handle follow or unfollow
            $userCible = $_POST['user_to_follow_unfollow'];
            $stmt_is_follower->execute([$userCible, $_SESSION['idUser']]);
            if(!$stmt_is_follower->rowCount()>0){
                //follow this user
                $stmt_set_follower->execute([$userCible, $_SESSION['idUser'], $actionDateTime]);
                $stmt_all_follower->execute([$userCible]);
                $actionResult['total'] = $stmt_all_follower->rowCount();
                $actionResult['actionType'] = "FOLLOW";
                $actionResult['status'] = 1;
            }
            else{
                //Unfollow user
                $stmt_remove_follower->execute([$userCible, $_SESSION['idUser']]);
                $stmt_all_follower->execute([$userCible]);
                $actionResult['total'] = $stmt_all_follower->rowCount();
                $actionResult['actionType'] = "UNFOLLOW";
                $actionResult['status'] = 1;

            }

        }
        else{
            //Action not handled
            $errorMsg .="Action not handled|";
        }

    }catch(PDOException $e){
        $queryError['query_error'] = $e->getMessage();
    }
}
else{

    $errorMsg .= "No user online|";
}

//Final merge
//Query error
$actionResult['action_error'] = $errorMsg;
$APIResponse = array_merge($APIResponse, array_merge($queryError, $actionResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);