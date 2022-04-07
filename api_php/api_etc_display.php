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
//$field = $_POST['field'];
//$value = $_POST['value'];

try{
    $sql_select_all ="";

}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}


//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $testResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);