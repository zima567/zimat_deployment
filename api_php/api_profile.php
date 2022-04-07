<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$userProfileInfo = array("user_found"=>0);
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
    
}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}



//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $userProfileInfo));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);