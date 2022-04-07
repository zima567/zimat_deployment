<?php
session_start();
//connect to DB
//require ("connection.php");

//api response
$APIResponse = array();
//$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
//$queryError = array("query_error"=>"NONE");
$logoutResult = array("succ_logout"=>0, "already_logout"=>0, "msg"=>"NONE");

if(isset($_SESSION['idUser']) && $_SESSION['idUser']!=""){
    //User was logged-in
    session_destroy();
    $logoutResult['succ_logout'] = 1;
    $logoutResult['msg'] = "User successfully logged-out";
}
else{
    //no online user
    $logoutResult['already_logout'] = 1;
    $logoutResult['msg'] = "User has already been logged out";
}


//Final merge
//Query error
//$APIResponse = array_merge($APIResponse, array_merge($queryError, $authentification));
$APIResponse = $logoutResult;

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);