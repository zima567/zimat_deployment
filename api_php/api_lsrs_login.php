<?php
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$authentification = array("email"=>0, "password"=>0, "username"=>"NONE", "tokenHash"=>"NONE", "rememberMe"=>0);

try{
    //sql statement(s)
    $sql_select_user = "SELECT `idUser`, `password`, `username` FROM `user` WHERE `email` =?";
    $stmt1 = $connection->prepare($sql_select_user);

    $sql_get_verified_status = "SELECT `verified` FROM `user_verified` WHERE `idUserFK` =?";
    $stmt2 = $connection->prepare($sql_get_verified_status);

    $sql_update_hash_token = "UPDATE `user` SET `tokenHash` =? WHERE `idUser` =?";
    $stmt3 = $connection->prepare($sql_update_hash_token);

    $sql_get_hash = "SELECT `idUser`, `tokenHash` FROM `user` WHERE `tokenHash` =? AND `username` =?";
    $stmt4 = $connection->prepare($sql_get_hash);

    if(isset($_POST['email']) && isset($_POST['password'])){
        //POST variables
        $email = $_POST['email'];
        $password = $_POST['password'];

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
    
               if(isset($_POST['rememberMe']) && $_POST['rememberMe']==1){
                    //Create token hash
                    $str_to_hash = $row_select_user['username']."_".$_SESSION['idUser']."_".$_POST['loginDateTime'];
                    $str_hash = hash('md5', $str_to_hash);
                    if($stmt3->execute([$str_hash, $_SESSION['idUser']])){
                        $authentification['tokenHash'] = $str_hash;
                        $authentification['rememberMe'] = 1;
                    }
               }
    
                //Return username
                $authentification['username'] = $row_select_user['username'];
            }
        }
    }
    elseif(isset($_POST['tokenHash']) && isset($_POST['username'])){
        //Handle login with token hash
        $stmt4->execute([$_POST['tokenHash'], $_POST['username']]);
        if($stmt4->rowCount()>0){
            $row_user_info = $stmt4->fetch();
             //Set session variables
             session_start();
             $_SESSION['idUser'] = $row_user_info['idUser'];
             $authentification['username'] = $_POST['username'];
             $authentification['tokenHash'] = "MATCH";
             //$_SESSION['verified'] = $row_verified['verified'];
        }

    }
    else{
        $queryError['query_error'] = "REQUEST_NOT_HANDLE";
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