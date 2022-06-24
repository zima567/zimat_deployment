<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
$APIResponse = array("arr_status"=>array(), "arr_users_FY"=>array(), "arr_users_MTF"=>array());
//Utilities variables
$queryError = array("query_error"=>"NONE", "user_online"=>0, "username"=>"NONE", "user_avatar"=>"NONE", "idUserOnline"=>0);
//Array user you've like events of
//$arrUsersEL = array();
//Array user who is following you
$arrUsersFY = array();
//Array user of platform
$arrUsersMTF = array();

try{

    $sql_user_infos = "SELECT `idUser`, `username`, `avatar` FROM `user` INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK` WHERE `user`.`idUser` =?";
    $stmt1 = $connection->prepare($sql_user_infos);

    $sql_users_EL = "SELECT DISTINCT `idUser`, `username`, `avatar` FROM (((`event_like` INNER JOIN `event` ON `event_like`.`idEventFK` = `event`.`idEvent`) INNER JOIN `user` ON `event`.`directorFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK`) WHERE `idLikerFK` =?";
    $stmt2 = $connection->prepare($sql_users_EL);

    $sql_users_FY = "SELECT `idUser`, `username`, `avatar` FROM ((`user_follower` INNER JOIN `user` ON `user_follower`.`idFollowerFK` = `user`.`idUser`) INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK`) WHERE `user_follower`.`idUserFK`=?";
    $stmt3 = $connection->prepare($sql_users_FY);

    $sql_users_MTF = "SELECT `idUser`, `username`, `avatar` FROM `user` INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK` WHERE `username` =?";
    $stmt4 = $connection->prepare($sql_users_MTF);

    $sql_check_if_follow = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK`=? AND `idFollowerFK`=?";
    $stmt_check_if_follow = $connection->prepare($sql_check_if_follow);

    if(isset($_SESSION['idUser'])){
        //user is oline
        $queryError['user_online'] = 1;
        $idUserOnline = $_SESSION['idUser'];
        $queryError['idUserOnline'] = $idUserOnline;

        $stmt1->execute([$idUserOnline]);
        $row_info_user = $stmt1->fetch();
        $queryError['username'] = $row_info_user['username'];
        $queryError['user_avatar'] = $row_info_user['avatar'];

        //select user of which you like events
       /* $stmt2->execute([$idUserOnline]);
        if($stmt2->rowCount()>0){
            while($row_users_EL = $stmt2->fetch()){
                $stmt_check_if_follow->execute([$row_users_EL['idUser'], $idUserOnline]);
                if(!$stmt_check_if_follow->rowCount()>0 && $row_users_EL['idUser']!=$idUserOnline){
                    //user online ain't following this id yet
                    array_push($arrUsersEL, array("idUser"=>$row_users_EL['idUser'],
                                                  "username"=>$row_users_EL['username'],
                                                  "avatar"=>$row_users_EL['avatar']));
                }
            }
        }*/

        //Select user who follows
        $stmt3->execute([$idUserOnline]);
        if($stmt3->rowCount()>0){
            while($row_users_FY = $stmt3->fetch()){
                $stmt_check_if_follow->execute([$row_users_FY['idUser'], $idUserOnline]);
                if(!$stmt_check_if_follow->rowCount()>0 && $row_users_FY['idUser']!= $idUserOnline){
                    //user online ain't following this id yet
                    array_push($arrUsersFY, array("idUser"=>$row_users_FY['idUser'],
                                                  "username"=>$row_users_FY['username'],
                                                  "avatar"=>$row_users_FY['avatar']));
                }
            }
        }

        //Select user mandatory
        $username1 = "ZIMAWARE";
        $stmt4->execute([$username1]);
        if($stmt4->rowCount()>0){
            while($row_users_MTF = $stmt4->fetch()){
                $stmt_check_if_follow->execute([$row_users_MTF['idUser'], $idUserOnline]);
                if(!$stmt_check_if_follow->rowCount()>0 && $row_users_MTF['idUser']!=$idUserOnline){
                    //user online ain't following this id yet
                    array_push($arrUsersMTF, array("idUser"=>$row_users_MTF['idUser'],
                                                   "username"=>$row_users_MTF['username'],
                                                   "avatar"=>$row_users_MTF['avatar']));

                } 
            }
        }

    }
    else{
        //user is not online
        $queryError['query_error'] = "No suggest user offline";
    }

}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
}



//Final merge
//Query error
$arr_status = array_merge($con_status, $queryError);
//$APIResponse = array("arr_status"=>array(), "arr_events_following"=>array(), "arr_event_related_categ"=>array(), "arr_event_default"=>array());
$APIResponse['arr_status'] = $arr_status;
//$APIResponse['arr_users_EL'] = $arrUsersEL;
$APIResponse['arr_users_FY'] = $arrUsersFY;
$APIResponse['arr_users_MTF'] = $arrUsersMTF;

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);
