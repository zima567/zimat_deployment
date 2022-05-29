<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
$APIResponse = array("arr_status"=>array(), "arr_return"=>array());

//Array error handler
$multipleHandler = array("query_error"=>"NONE", "divers_error"=>"NONE", "action_type"=>"NONE", "config_type"=>"NONE", "action_status"=>0);

if(isset($_SESSION['idUser'])){
    //user online
    if(isset($_POST['action_type']) && isset($_POST['config_type'])){
        //action_type and config_type are set
        try{
            //Check the action_type
            if($_POST['action_type']=="T_SELECT"){

                $multipleHandler['action_type'] = "T_SELECT";
                //Check for configuration types
                if($_POST['config_type']=="select_categ_not_of_users"){
                    /**********config - start***********/
                    $multipleHandler['config_type'] = "select_categ_not_of_users";

                    //Select event base on user categ profiling
                    $sql_user_categ = "SELECT `categ_profiling` FROM `user_profile` WHERE `idUserFK` =? ";
                    $stmt_user_categ = $connection->prepare($sql_user_categ);
                    $userArrCateg =array();
                    $stmt_user_categ->execute([$_SESSION['idUser']]);
                    if($stmt_user_categ->rowCount()>0){
                        $stmt_row_categ = $stmt_user_categ->fetch();
                        $strCateg = trim($stmt_row_categ['categ_profiling']);
                        if(!empty($strCateg)){$userArrCateg = explode(" ",$strCateg);}
                    }

                    if(!count($userArrCateg)>0){
                        //User has no preferred categories
                        $sql_range_categ = "SELECT `idCategory`, `title` FROM `category` LIMIT 100";
                        $stmt_range_categ = $connection->prepare($sql_range_categ);
                        $stmt_range_categ->execute();
                        if($stmt_range_categ->rowCount()>0){
                            $temp_arr_categ = array();
                            while($row_range_categ = $stmt_range_categ->fetch()){
                                array_push($temp_arr_categ, array("idCategory"=>$row_range_categ['idCategory'],
                                                                  "title"=>$row_range_categ['title']));
                            }
                            $APIResponse['arr_return'] = $temp_arr_categ;
                            $multipleHandler['action_status'] = 1;
                        }
                    }
                    else{
                        //user has already preffered categories
                        $sql_rest_of_categ = " SELECT `idCategory`, `title` FROM `category` WHERE `title` NOT IN ( '";
                        $count = 0;
                        foreach($userArrCateg as $item) {
                            $sql_rest_of_categ .= $item;
                            if ($count != count($userArrCateg) - 1)
                            $sql_rest_of_categ .= "', '";
                            $count++;
                        }
                        $sql_rest_of_categ .= "') LIMIT 100";

                        if($count!=0){
                            $stmt_range_categ = $connection->prepare($sql_rest_of_categ);
                            $stmt_range_categ->execute();
                            if($stmt_range_categ->rowCount()>0){
                                $temp_arr_categ = array();
                                while($row_range_categ = $stmt_range_categ->fetch()){
                                    array_push($temp_arr_categ, array("idCategory"=>$row_range_categ['idCategory'],
                                                                      "title"=>$row_range_categ['title']));
                                }
                                $APIResponse['arr_return'] = $temp_arr_categ;
                                $multipleHandler['action_status'] = 1;
                            }
                        }

                    }

                     /**********config - end***********/
                }
                else{
                    $multipleHandler['config_type'] = "NOT_HANDLED";
                    $multipleHandler['divers_error'] = "CONFIG_TYPE_NOT_HANDLED";
                }

            }
            elseif($_POST['action_type']=="T_UPDATE"){

                $multipleHandler['action_type'] = "T_UPDATE";
                if($_POST['config_type']=="update_user_categories"){
                    $multipleHandler['config_type'] = "update_user_categories";
                    
                    $sql_select_categ_str = "SELECT `categ_profiling` FROM `user_profile` WHERE `idUserFK` =?";
                    $stmt_select_categ_str = $connection->prepare($sql_select_categ_str);

                    $sql_update_categ_str = "UPDATE `user_profile` SET `categ_profiling` =? WHERE `idUserFK` =?";
                    $stmt_update_categ_str = $connection->prepare($sql_update_categ_str);

                    $sql_test_categ_name = "SELECT `idCategory` FROM category WHERE `title` =?";
                    $stmt_test_categ_name = $connection->prepare($sql_test_categ_name);

                    function isCategNameCorrect($stmt_test_categ_name, $categName){
                        $stmt_test_categ_name->execute([$categName]);
                        if($stmt_test_categ_name->rowCount()>0) return true;
                        return false;
                    }

                    if(isset($_POST['arr_user_categs'])){
                        $arr_user_categs = $_POST['arr_user_categs'];
                        $new_user_categ_str = "";
                        //Build string
                        foreach($arr_user_categs as $item) {
                           if(isCategNameCorrect($stmt_test_categ_name, $item)){
                               $new_user_categ_str .=$item." ";
                           }
                        }
                        
                        if(!empty(trim($new_user_categ_str))){
                            $stmt_select_categ_str->execute([$_SESSION['idUser']]);
                            if($stmt_select_categ_str->rowCount()>0){

                                $row_select_categ_str = $stmt_select_categ_str->fetch();
                                $update_str = trim($new_user_categ_str)." ".trim($row_select_categ_str['categ_profiling']);
                                if($stmt_update_categ_str->execute([$update_str, $_SESSION['idUser']]))  $multipleHandler['action_status'] = 1;

                            }
                            else{

                                if($stmt_update_categ_str->execute([$new_user_categ_str, $_SESSION['idUser']]))  $multipleHandler['action_status'] = 1;
                            }
                        }

                    }

                }
                elseif($_POST['config_type']=="update_user_location"){
                    $multipleHandler['config_type'] = "update_user_location";

                    $sql_select_ids_city_country = "SELECT `idCountry`, `idCity` FROM `cities` INNER JOIN `country` ON `cities`.`idCountryFK` = `country`.`idCountry` WHERE `cities`.`name` =?";
                    $stmt_ids = $connection->prepare($sql_select_ids_city_country);

                    $sql_update_user_location = "UPDATE `user_profile` SET `location_country` =?, `location_city` =? WHERE `idUserFK` =?";
                    $stmt_update_user_location = $connection->prepare($sql_update_user_location);

                    if(isset($_POST['city_name'])){
                        $cityName = $_POST['city_name'];
                        $stmt_ids->execute([$cityName]);
                        if($stmt_ids->rowCount()>0){
                            $row_stmt_ids = $stmt_ids->fetch();
                            if($stmt_update_user_location->execute([$row_stmt_ids['idCountry'], $row_stmt_ids['idCity'], $_SESSION['idUser']])) $multipleHandler['action_status'] = 1;
                        }
                    }
                    
                }
                else{
                    $multipleHandler['config_type'] = "NOT_HANDLED";
                    $multipleHandler['divers_error'] = "CONFIG_TYPE_NOT_HANDLED";
                }

            }
            elseif($_POST['action_type']=="T_INSERT"){

                $multipleHandler['action_type'] = "T_INSERT";

            }
            elseif($_POST['action_type']=="T_DELETE"){

                $multipleHandler['action_type'] = "T_DELETE";

            }
            else{
                $multipleHandler['action_type'] = "NOT_HANDLED";
                $multipleHandler['divers_error'] = "ACTION_TYPE_NOT_HANDLED";
            }

        }catch(PDOException $e){
            $multipleHandler['query_error'] = $e->getMessage();
        }
    }
    else{
        $multipleHandler['divers_error'] = "POST_VARS_ACTION_CONFIG_TYPE_UNSET";
    }
}
else{
    //user offline
    $multipleHandler['divers_error'] = "NO_USER_ONLINE";
}


//Final merge
$arr_status = array_merge($con_status, $multipleHandler);
$APIResponse['arr_status'] = $arr_status;

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);
