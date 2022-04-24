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
$actionResult = array("status"=>0, "actionType"=>"NONE", "total_likes"=>0, "action_error"=>"NONE");
$errorMsg="";

//Post variables
//below inside conditions

if(isset($_SESSION['idUser']) && isset($_POST['actionType'])){
    //post variables here...
    $actionType = $_POST['actionType'];
    $eventID = $_POST['eventID'];
    $likeDateTime = isset($_POST['likeDateTime'])? $_POST['likeDateTime'] : "0000-00-00 00:00:00";

    try{

        $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_event_like = $connection->prepare($sql_event_like);

        $sql_add_event_like = "INSERT INTO `event_like` (`idEventFK`, `idLikerFK`, `likeDate`) VALUES(?,?,?)";
        $stmt_add_event_like = $connection->prepare($sql_add_event_like);

        $sql_remove_event_like = "DELETE FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_remove_event_like = $connection->prepare($sql_remove_event_like);

        $sql_all_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
        $stmt_all_like = $connection->prepare($sql_all_like);

        if($actionType=="EVENT_LIKE"){
            //Handle like for event
            $actionResult['actionType'] = "EVENT_LIKE";
            //Test if user already like event
            $stmt_event_like->execute([$eventID, $_SESSION['idUser']]);
            if(!$stmt_event_like->rowCount()>0){
                //User haven't liked event yet
                $stmt_add_event_like->execute([$eventID, $_SESSION['idUser'], $likeDateTime]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total_likes'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 1;
            }
            else{
                //user have already liked this event
                //Automatically the unlike query will be executed
                $stmt_remove_event_like->execute([$eventID, $_SESSION['idUser']]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total_likes'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 2;
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