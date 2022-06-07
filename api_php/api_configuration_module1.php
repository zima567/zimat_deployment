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
                //Set variable editDateTime to  know when update action has occured
                $editDateTime = isset($_POST['editDateTime'])? $_POST['editDateTime'] : "0000-00-00 00:00:00";

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
                elseif($_POST['config_type']=="update_event_details" && isset($_POST['idEvent'])){
                    $multipleHandler['config_type'] = "update_event_details";
                    //Check if ID event is right
                    $sql_check_event = "SELECT `idEvent` FROM `event` WHERE `idEvent` =?";
                    $stmt_check_event = $connection->prepare($sql_check_event);
                    $stmt_check_event->execute([$_POST['idEvent']]);

                    if($stmt_check_event->rowCount()>0){
                        $fieldUpdateStatus = array("is_title_updated"=>null, "is_postMessage_updated"=>null, "is_description_updated"=>null, "is_city_updated"=>null, "is_address_updated"=>null, "is_dateTime_updated"=>null, "is_categories_updated"=>null, "is_categories_updated_all_good"=>null, "is_categories_deleted"=>null, "is_posters_updated"=>null, "is_posters_deleted"=>null, "is_posters_deleted_all_good"=>null, "is_price_updated"=>null);
                        
                        if(isset($_POST['update_title'])){
                            //Update title
                            $sql_update_title = "UPDATE `event` SET `title` =? WHERE `idEvent` =?";
                            $stmt_update_title = $connection->prepare($sql_update_title);
                            if($stmt_update_title->execute([$_POST['update_title'], $_POST['idEvent']])){$fieldUpdateStatus['is_title_updated']=1;}
                        }   

                        if(isset($_POST['update_postMessage'])){
                            //Update post message
                            $sql_update_postMessage = "UPDATE `event` SET `postMessage` =? WHERE `idEvent` =?";
                            $stmt_update_postMessage = $connection->prepare($sql_update_postMessage);
                            if($stmt_update_postMessage->execute([$_POST['update_postMessage'], $_POST['idEvent']])){$fieldUpdateStatus['is_postMessage_updated']=1;}
                        }

                        if(isset($_POST['update_description'])){
                            // update event description
                            $sql_update_description = "UPDATE `event` SET `description` =? WHERE `idEvent` =?";
                            $stmt_update_description = $connection->prepare($sql_update_description);
                            if($stmt_update_description->execute([$_POST['update_description'], $_POST['idEvent']])){$fieldUpdateStatus['is_description_updated']=1;}
                        }

                        if(isset($_POST['update_city']) && isset($_POST['event_country'])){
                            //Update event city
                            $sql_check_country = "SELECT `location_country` FROM `event` WHERE `idEvent` =?";
                            $stmt_check_country = $connection->prepare($sql_check_country);
                            $stmt_check_country->execute([$_POST['idEvent']]);
                            $row_check_country = $stmt_check_country->fetch();
                            if($row_check_country['location_country'] == $_POST['event_country']){
                                //Country of event stayed correctly set
                                $sql_update_city = "UPDATE `event` SET `location_city` =? WHERE `idEvent` =?";
                                $stmt_update_city = $connection->prepare($sql_update_city);
                                if($stmt_update_city->execute([$_POST['update_city'], $_POST['idEvent']])){$fieldUpdateStatus['is_city_updated']=1;}
                            }
                            
                        }

                        if(isset($_POST['update_date_time'])){
                            //Update event date $_POST['dateTime']
                            $sql_update_dateTime = "UPDATE `event` SET `dateTime` =? WHERE `idEvent` =?";
                            $stmt_update_dateTime= $connection->prepare($sql_update_dateTime);
                            if($stmt_update_dateTime->execute([$_POST['update_date_time'], $_POST['idEvent']])){$fieldUpdateStatus['is_dateTime_updated']=1;}
                           
                        }

                        if(isset($_POST['update_address'])){
                            $sql_update_address = "UPDATE `event` SET `location` =? WHERE `idEvent` =?";
                            $stmt_update_address = $connection->prepare($sql_update_address);
                            if($stmt_update_address->execute([$_POST['update_address'], $_POST['idEvent']])){$fieldUpdateStatus['is_address_updated']=1;}
                        }

                        if(isset($_POST['update_categories'])){
                            //Update event categories
                            $arrCateg = $_POST['update_categories'];
                            //It will receive two arrays. One containing categs from the box, the other, categs that has been removed from the box
                            //A comparison will be made in order to know categs that will be added and the one that will be deleted.
                            $sql_get_categ_id = "SELECT `idCategory` FROM `category` WHERE `title` =?";
                            $stmt_get_categ_id = $connection->prepare($sql_get_categ_id);

                            $sql_categ_already_exist = "SELECT `idCategFK` FROM `event_categ` WHERE `idCategFK`=? AND `idEventFK`=? ";
                            $stmt_categ_already_exist = $connection->prepare($sql_categ_already_exist);

                            $sql_set_categ = "INSERT INTO `event_categ` (`idCategFK`, `idEventFK`) VALUES(?,?)";
                            $stmt_set_categ = $connection->prepare($sql_set_categ);

                             //Arr contain categ to add
                             foreach($arrCateg as $categTitle){
                                $stmt_get_categ_id->execute([$categTitle]);
                                if($stmt_get_categ_id->rowCount()>0){
                                    //id found
                                    $row_id = $stmt_get_categ_id->fetch();
                                    //Check if event categ exist already
                                    $stmt_categ_already_exist->execute([$row_id['idCategory'], $_POST['idEvent']]);
                                    if(!$stmt_categ_already_exist->rowCount()>0){
                                        //This categ is not already set for this event
                                        if($stmt_set_categ->execute([$row_id['idCategory'], $_POST['idEvent']])){$fieldUpdateStatus['is_categories_updated']=1;}
                                    }
                                }
                            }
                            

                        }

                        if(isset($_POST['delete_categories'])){
                            //Delete categories
                            $arrCateg_delete = $_POST['delete_categories'];

                            $sql_get_categ_id = "SELECT `idCategory` FROM `category` WHERE `title` =?";
                            $stmt_get_categ_id = $connection->prepare($sql_get_categ_id);

                            $sql_delete_categ = "DELETE FROM `event_categ` WHERE `idCategFK` =? AND `idEventFK` =?";
                            $stmt_delte_categ = $connection->prepare($sql_delete_categ);

                            foreach($arrCateg_delete as $categTitle){
                                $stmt_get_categ_id->execute([$categTitle]);
                                if($stmt_get_categ_id->rowCount()>0){
                                    //id found
                                    $row_id = $stmt_get_categ_id->fetch();
                                   //remove this categ from this event
                                   if($stmt_delte_categ->execute([$row_id['idCategory'], $_POST['idEvent']])){$fieldUpdateStatus['is_categories_deleted'] =1;}
                                }
                            }
                        }

                        if(isset($_POST['update_price'])){
                            //Update event price
                            $sql_get_latest = "SELECT `currency`, `onlinePayment`, `offlinePayment`, `idEventFK` FROM `event_pricing` WHERE `idEventFK` =? ORDER BY `latestUpdate` DESC";
                            $stmt_get_latest = $connection->prepare($sql_get_latest);

                            $sql_set_price ="INSERT INTO `event_pricing` (`price`, `currency`, `onlinePayment`, `offlinePayment`, `latestUpdate`, `idEventFK`) VALUES(?,?,?,?,?,?)";
                            $stmt_set_price = $connection->prepare($sql_set_price);

                            $stmt_get_latest->execute([$_POST['idEvent']]);
                            if($stmt_get_latest->rowCount()>0){
                                //Get the previous price of event ticket
                                $row_get_latest = $stmt_get_latest->fetch();
                                $cast_price = (float) $_POST['update_price'];
                                if($stmt_set_price->execute([$cast_price, $row_get_latest['currency'], $row_get_latest['onlinePayment'], $row_get_latest['offlinePayment'], $editDateTime, $_POST['idEvent']])){$fieldUpdateStatus['is_price_updated'] =1;}
                            }
        
                        }

                        if(isset($_FILES['posters'])){
                            //If there is posters for that event
                            //For this section I copied the code from the create_event.. file. I have to do some modification
                            $arrPosterToUpload = array();
                            $errorUpload = "";
                            $FILES_length = 0;

                            //SQL
                            $sql_insert_posters = "INSERT INTO `event_poster`(`linkToPoster`, `dateUploaded`, `idEventFK`) VALUES(?,?,?)";
                            $stmt2 = $connection->prepare($sql_insert_posters);

                            // File upload configuration 
                            $targetDir = "../media/posters/"; 
                            $allowTypes = array('jpg','png','jpeg','gif'); 
                            $fileNames = array_filter($_FILES['posters']['name']);
                            if(!empty($fileNames)){ 
                                //Get the length of this array to know how many images were sent
                                $FILES_length = count($_FILES['posters']['name']);
                               

                                foreach($_FILES['posters']['name'] as $key=>$val){ 
                                    // File upload path 
                                    $fileName = basename($_FILES['posters']['name'][$key]);
                                    $randomNumIdStr = mt_rand()."_".$_SESSION['idUser'];
                                    $targetFilePath = $targetDir.$randomNumIdStr.$fileName; //We add the user id and random to make sure each file has diff names then avoid deleting posters issues
                        
                                    // Check whether file type is valid 
                                    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION); 
                                    if(in_array($fileType, $allowTypes)){
                                         
                                        if($_FILES["posters"]["size"][$key] <= 1572864){ //1.5MB
                                                // Upload file to server 
                                            if(move_uploaded_file($_FILES["posters"]["tmp_name"][$key], $targetFilePath)){
                                                //Base on where this image will be use in folder structure we remove ../
                                                $targetFilePath = str_replace("../","", $targetFilePath);
                                                // Image db insert sql
                                                array_push($arrPosterToUpload, array("target"=>$targetFilePath));
                    
                                            }else{ 
                                                $errorUpload .= $_FILES['posters']['name'][$key].' | '; 
                                            } 
                                        }
                                        else{
                                            $errorUpload .= $_FILES['posters']['name'][$key].' | '; 
                                        }
                                    }else{ 
                                        $errorUpload .= $_FILES['posters']['name'][$key].' | '; 
                                    } 
                                }

                            }
                              
                    

                            //Insert event posters
                            if($FILES_length!=0){
                                //There is file pictures/posters to upload
                                if($FILES_length === count($arrPosterToUpload)){
                                    //All the image files has been uploaded to server
                                    //Start a transaction
                                    $connection->beginTransaction();
                                    foreach($arrPosterToUpload as $arrToDb){
                                        $stmt2->execute([$arrToDb['target'], $editDateTime, $_POST['idEvent']]); 
                                    }
                                    //commit
                                    $connection->commit();
                                    $fieldUpdateStatus['is_posters_updated'] = 1;
                                }
                                else{

                                    foreach($arrPosterToUpload as $arr){
                                        $unlinkPath = "../".$arr["target"];
                                        unlink($arr["target"]);
                                    }

                                    $multipleHandler['divers_error'] = $errorUpload." did not meet the requirements.";
                                    //throw new PDOException("The images uploaded did not meet requirements");  
                                }
                            }
                        }

                        if(isset($_POST['delete_posters'])){
                            //Delete posters
                            $arrPostersToDelete = $_POST['delete_posters'];
                            //Delete from the database then after unlink them from corresponding folder
                            //create a transaction and revert it if all pictures haven't correctly being unlink
                            $sql_delete_posters = "DELETE FROM `event_poster` WHERE `linkToPoster` =?";
                            $stmt_delete_posters = $connection->prepare($sql_delete_posters);

                            //Start a transaction
                            $connection->beginTransaction();
                            foreach($arrPostersToDelete as $unit){
                                $stmt_delete_posters->execute([$unit]);
                            }
                            //commit
                            $connection->commit();
                            $fieldUpdateStatus['is_posters_deleted'] = 1;

                            foreach($arrPostersToDelete as $unit){
                                $completePath = "../".$unit;
                                unlink($completePath);
                            }

                            
                        }

                        $multipleHandler = array_merge($multipleHandler, $fieldUpdateStatus);

                    }
                    else{
                        //Event is not found
                        $multipleHandler['divers_error'] = "EVENT_NOT_FOUND";
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
            $connection->rollBack();
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
