<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$testResult = array("record_found"=>0);

//POST variables
$field = $_POST['field'];
$value = $_POST['value'];

try{
    //queries
    $postValueUnknown = false;
    $sql_string = "";

    if($field == "EMAIL"){
        $sql_string = "SELECT `idUser` FROM `user` WHERE `email` =? ";
    }
    elseif($field == "USERNAME"){
        $sql_string = "SELECT `idUser` FROM `user` WHERE `username` =? ";
    }
    else{
        $postValueUnknown = true;
    }

    if(!$postValueUnknown){
        $stmt = $connection->prepare($sql_string);
        $stmt->execute([$value]);
        if($stmt->rowCount()>0){
            //user with such details exists
            $testResult['record_found'] = 1;
        }
        else{
            //No user with such details
            $testResult['record_found'] = 0;
        }
    }
}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}

//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $testResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);