<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$authentification = array("email"=>0, "password"=>0, "username"=>"NONE");

//POST variables
$email = $_POST['email'];
$password = $_POST['password'];
//echo password_hash($password, PASSWORD_DEFAULT);

try{
    //sql statement(s)
    $sql_select_user = "SELECT `idUser`, `password`, `username` FROM `user` WHERE `email` =?";
    $stmt1 = $connection->prepare($sql_select_user);

    $sql_get_verified_status = "SELECT `verified` FROM `user_verified` WHERE `idUserFK` =?";
    $stmt2 = $connection->prepare($sql_get_verified_status);

    $stmt1->execute([$email]);
    if($stmt1->rowCount()>0){
        //user with that email exist
        $authentification['email'] = 1;

        $row_select_user = $stmt1->fetch();
        if(password_verify($password, $row_select_user['password'])){
            //Password match hash, good password
            $authentification['password'] = 1;

            //Get vars to set sessionvar
            $stmt2->execute([$row_select_user['idUser']]);
            $row_verified = $stmt2->fetch();

            //Set session variables
            session_start();
            $_SESSION['idUser'] = $row_select_user['idUser'];
            //$_SESSION['verified'] = $row_verified['verified'];

            //Return username
            $authentification['username'] = $row_select_user['username'];
        }
    }

}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}

//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $authentification));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);