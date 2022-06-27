<?php
//Mailer php custom file
require("mailing.php");

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
                if($_POST['config_type']=="select_categ_of_users"){
                    /**********config - start***********/
                    $multipleHandler['config_type'] = "select_categ_of_users";

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

                    $sql_range_categ = "SELECT `idCategory`, `title` FROM `category` LIMIT 200";
                    $stmt_range_categ = $connection->prepare($sql_range_categ);
                    $stmt_range_categ->execute();
                    if($stmt_range_categ->rowCount()>0){
                        $temp_arr_categ = array();
                        while($row_range_categ = $stmt_range_categ->fetch()){
                            array_push($temp_arr_categ, array("idCategory"=>$row_range_categ['idCategory'],
                                                               "title"=>$row_range_categ['title']));
                        }
                        $temp_api_return = array("arr_user_categ"=>$userArrCateg, "arr_all_categ"=>$temp_arr_categ);
                        $APIResponse['arr_return'] = $temp_api_return;
                        $multipleHandler['action_status'] = 1;
                    }
                    

                     /**********config - end***********/
                }
                elseif($_POST['config_type']=="select_complete_location_of_user"){
                    $multipleHandler['config_type'] = "select_complete_location_of_user";
                    //select user country and city
                    $sql_full_location = "SELECT `country`.`name` AS `location_country`, `cities`.`name` AS `location_city` FROM ((`user_profile` INNER JOIN `country` ON `user_profile`.`location_country` = `country`.`idCountry`) INNER JOIN `cities` ON `user_profile`.`location_city` = `cities`.`idCity`) WHERE `user_profile`.`idUserFK` =?";
                    $stmt_full_location = $connection->prepare($sql_full_location);
                    $stmt_full_location->execute([$_SESSION['idUser']]);
                    if($stmt_full_location->rowCount()>0){
                        $row_full_location = $stmt_full_location->fetch();
                        $APIResponse['arr_return'] = array("location_country"=>$row_full_location['location_country'], "location_city"=>$row_full_location['location_city']);
                        $multipleHandler['action_status'] = 1;   
                    }
                }
                elseif($_POST['config_type']=="select_user_socials"){
                    $multipleHandler['config_type'] = "select_user_socials";

                    //Select user sucials
                    $arr_user_socials = array("facebook"=>"NONE", "instagram"=>"NONE", "whatsApp"=>"NONE", "twitter"=>"NONE", "vk"=>"NNOE");
                    $sql_user_socials = "SELECT `facebook`, `instagram`, `twitter`, `vk`, `whatsApp` FROM `user_socials` WHERE `idUserFK` =?";
                    $stmt_user_socials = $connection->prepare($sql_user_socials);
                    $stmt_user_socials->execute([$_SESSION['idUser']]);
                    if($stmt_user_socials->rowCount()>0){
                        $multipleHandler['action_status'] = 1;   

                        $row_user_socials = $stmt_user_socials->fetch();
                        $arr_user_socials['facebook'] = $row_user_socials['facebook'];
                        $arr_user_socials['instagram'] = $row_user_socials['instagram'];
                        $arr_user_socials['whatsApp'] = $row_user_socials['whatsApp'];
                        $arr_user_socials['twitter'] = $row_user_socials['twitter'];
                        $arr_user_socials['vk'] = $row_user_socials['vk'];

                    }
                    $APIResponse['arr_return'] = $arr_user_socials;
                    
                }
                elseif($_POST['config_type']=="select_user_acc_verification_info"){
                    $multipleHandler['config_type'] = "select_user_acc_verification_info";

                    $temp_api_return = array("is_account_verified"=>0, "is_email_verified"=>0, "email"=>"NONE");
                    $allGood = true;
                    //SQLs
                    $sql_get_user_email = "SELECT `email` FROM `user` WHERE `idUser` =?";
                    $stmt_get_user_email = $connection->prepare($sql_get_user_email);

                    $sql_acc_verification = "SELECT `idUserFK`, `verified` FROM `user_verified` WHERE `idUserFK` =?";
                    $stmt_acc_verification = $connection->prepare($sql_acc_verification);

                    $sql_email_verification = "SELECT `idUserFK` FROM `user_profile` WHERE `verification_email` =? AND `idUserFK` =?";
                    $stmt_email_verification = $connection->prepare($sql_email_verification);

                    $stmt_acc_verification->execute([$_SESSION['idUser']]);
                    if($stmt_acc_verification->rowCount()>0){
                        $row_acc_verification = $stmt_acc_verification->fetch();
                        if($row_acc_verification['verified']==0){
                            //Account not yet verified or verification is rolling
                            $temp_api_return['is_account_verified'] = 0;
                            //Check if email is verified
                            $stmt_email_verification->execute([1, $_SESSION['idUser']]);
                            if($stmt_email_verification->rowCount()>0){
                                //Email is verified
                                $temp_api_return['is_email_verified'] = 1;
                                //Get email of user where email for acc verification will be sent
                                $stmt_get_user_email->execute([$_SESSION['idUser']]);
                                if($stmt_get_user_email->rowCount()>0){
                                    $row_get_user_email = $stmt_get_user_email->fetch();
                                    $temp_api_return['email'] = $row_get_user_email['email'];
                                }
                                else{
                                    //could not find email of user. Something is wrong set action proccess to 0
                                    $temp_api_return['email'] = "ERROR";
                                    $allGood = false;
                                }
                            }
    
                        }
                        elseif($row_acc_verification['verified']==1){
                            //Account verified
                            $temp_api_return['is_account_verified'] = 1;
                        }
                        elseif($row_acc_verification['verified']==2){
                            //Account verification rolling
                            $temp_api_return['is_account_verified'] = 2;
                        }
                        else{
                            $temp_api_return['is_account_verified'] = -1;
                        }

                    }
                    else{
                        $allGood =false;
                    }
                    

                    //Set action status
                    if($allGood){$multipleHandler['action_status'] = 1; }
                    $APIResponse['arr_return'] = $temp_api_return;
            
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
                           
                            if($stmt_update_categ_str->execute([$new_user_categ_str, $_SESSION['idUser']]))  $multipleHandler['action_status'] = 1;
                            
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
                            $event_status = "RESCHEDULED";
                            $sql_update_dateTime = "UPDATE `event` SET `dateTime` =?, `status` =? WHERE `idEvent` =?";
                            $stmt_update_dateTime= $connection->prepare($sql_update_dateTime);
                            if($stmt_update_dateTime->execute([$_POST['update_date_time'], $event_status, $_POST['idEvent']])){$fieldUpdateStatus['is_dateTime_updated']=1;}
                           
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
                elseif($_POST['config_type']=="update_user_profile_details"){
                    $multipleHandler['config_type'] = "update_user_profile_details";
                    $temp_action_status = true;
                    $result_profile_update = array("stat_fname"=>1, "stat_lname"=>1, "stat_about"=>1, "img_error"=>array());

                    if(isset($_POST['fname'])){
                        $sql_update_fname = "UPDATE `user_profile` SET `firstName` =? WHERE `idUserFK` =?";
                        $stmt_update_fname = $connection->prepare($sql_update_fname);
                        if(!$stmt_update_fname->execute([$_POST['fname'], $_SESSION['idUser']])){ $temp_action_status = false; $result_profile_update['stat_fname'] =0; }
                    }

                    if(isset($_POST['lname'])){
                        $sql_update_lname = "UPDATE `user_profile` SET `lastName` =? WHERE `idUserFK` =?";
                        $stmt_update_lname = $connection->prepare($sql_update_lname);
                        if(!$stmt_update_lname->execute([$_POST['lname'], $_SESSION['idUser']])){ $temp_action_status = false; $result_profile_update['stat_lname'] =0; }

                    }

                    if(isset($_POST['about'])){
                        $sql_update_about = "UPDATE `user_profile` SET `bio` =? WHERE `idUserFK` =?";
                        $stmt_update_about = $connection->prepare($sql_update_about);
                        if(!$stmt_update_about->execute([$_POST['about'], $_SESSION['idUser']])){ $temp_action_status = false; $result_profile_update['stat_about'] =0; }
                    }

                    if(isset($_FILES['profile-avatar'])){
                        $sql_set_avatar = "UPDATE `user_profile` SET `avatar` =? WHERE `idUserFK` =?";
                        $stmt_set_avatar = $connection->prepare($sql_set_avatar);

                        $errors= array();
                        $path = "../media/profiles/";
                        $file_name = $path.basename($_FILES['profile-avatar']['name']);
                        $file_size =$_FILES['profile-avatar']['size'];
                        $file_tmp =$_FILES['profile-avatar']['tmp_name'];
                        $file_type=$_FILES['profile-avatar']['type'];
                        $file_ext=strtolower(pathinfo($file_name,PATHINFO_EXTENSION));
                        
                        $extensions= array("jpeg","jpg","png");
                        
                        if(in_array($file_ext,$extensions)=== false){
                           $errors[]="extension not allowed, please choose a JPEG or PNG file.";
                        }
                        
                        if($file_size >= 1572864){
                           $errors[]='File size too big.';
                        }
                        
                        if(empty($errors)==true){
                            
                           move_uploaded_file($file_tmp,$file_name);
                           //Add to database
                           $file_name_to_db = str_replace("../","", $file_name);
                           $stmt_set_avatar->execute([$file_name_to_db, $_SESSION['idUser']]);
                           //echo "Success";
                        }else{
                           //print_r($errors);
                           $temp_action_status = false;
                           $result_profile_update['img_error'] = $errors;

                        }

                    }

                    if($temp_action_status){
                        $multipleHandler['action_status'] = 1;
                    }
                    $APIResponse['arr_return'] = $result_profile_update;

                }
                elseif($_POST['config_type']=="config_event_agents" && isset($_POST['idEvent']) && isset($_POST['arr_agents'])){
                    $multipleHandler['config_type'] = "update_user_profile_details";
                    //Other post var
                    $varSellingRight = isset($_POST['sellingRight'])?$_POST['sellingRight']:0;
                    $varScanningRight = isset($_POST['scanningRight'])?$_POST['scanningRight']:0;

                    $sql_user_director = "SELECT `directorFK` FROM `event` INNER JOIN `event_agent` ON `event`.`idEvent` = `event_agent`.`idEventFK` WHERE `idEvent` =? AND `directorFK` =? AND `sellingRight` =? AND `scanningRight` =?";
                    $stmt_user_director = $connection->prepare($sql_user_director);

                    $sql_get_id_user = "SELECT `idUser` FROM `user` WHERE `username` =? AND `idUser`<>?";
                    $stmt_get_id_user = $connection->prepare($sql_get_id_user);

                    $sql_is_event_agent = "SELECT `idAgentFK` FROM `event_agent` WHERE `idAgentFK` =? AND `idEventFK` =?";
                    $stmt_is_event_agent = $connection->prepare($sql_is_event_agent);

                    $sql_update_agent = "UPDATE `event_agent` SET `sellingRight` =?, `scanningRight` =? WHERE `idAgentFK` =? AND `idEventFK` =?";
                    $stmt_update_agent = $connection->prepare($sql_update_agent);

                    $sql_delete_agent = "DELETE FROM `event_agent` WHERE `idAgentFK` =? AND `idEventFK` =?";
                    $stmt_delete_agent = $connection->prepare($sql_delete_agent);

                    $sql_set_agent = "INSERT INTO `event_agent` (`idAgentFK`, `idEventFK`, `sellingRight`, `scanningRight`) VALUES(?,?,?,?)";
                    $stmt_set_agent = $connection->prepare($sql_set_agent);

                    $stmt_user_director->execute([$_POST['idEvent'], $_SESSION['idUser'],1,1]);
                    if($stmt_user_director->rowCount()>0){
                        //User is director of this event
                        //Create array for agents statuses
                        $arr_agent_stats = array();

                        $arrAgents = $_POST['arr_agents'];
                        foreach($arrAgents as $agent){
                            $agent_added = false;
                            $agent_updated =false;

                            $stmt_get_id_user->execute([$agent, $_SESSION['idUser']]);
                            if($stmt_get_id_user->rowCount()>0){
                                //User valid
                                $row_get_id_user = $stmt_get_id_user->fetch();
                                $stmt_is_event_agent->execute([$row_get_id_user['idUser'], $_POST['idEvent']]);
                                //If is selling or scanning right is granted
                                if($stmt_is_event_agent->rowCount()>0){
                                    //User already an agent update
                                    if($stmt_update_agent->execute([$varSellingRight, $varScanningRight, $row_get_id_user['idUser'], $_POST['idEvent']])){$agent_updated=true;}
                                }
                                else{
                                    //User is not yet an agent insert agent
                                    if($stmt_set_agent->execute([$row_get_id_user['idUser'], $_POST['idEvent'], $varSellingRight, $varScanningRight])){$agent_added=true;}
                                }
                                
                            }
                            else{
                                //This username is found in our database
                                $multipleHandler['divers_error'] = "USER_DO_NOT_EXIST";
                            }

                            if($agent_added || $agent_updated){
                                $multipleHandler['action_status']=1;
                                array_push($arr_agent_stats, array("username"=>$agent, "status"=>1));
                            }
                            else{
                                array_push($arr_agent_stats, array("username"=>$agent, "status"=>0));
                            }
                        }
                        
                        $APIResponse['arr_return'] = $arr_agent_stats;
                    }
                    else{
                        //User online is not a director
                        $multipleHandler['divers_error'] = "USER_NOT_EVENT_DIRECTOR";
                    }


                }
                elseif($_POST['config_type']=="update_user_socials"){
                    $multipleHandler['config_type'] = "update_user_socials";

                    //SQLs
                    $sql_update_user_socials = "UPDATE `user_socials` SET `facebook` =?, `instagram` =?, `whatsApp` =? WHERE `idUserFK` =?";
                    $stmt_update_user_socials = $connection->prepare($sql_update_user_socials);

                    if(isset($_POST['fbLink']) && isset($_POST['igLink']) && isset($_POST['wspTel'])){
                        if($stmt_update_user_socials->execute([$_POST['fbLink'], $_POST['igLink'], $_POST['wspTel'], $_SESSION['idUser']])){ $multipleHandler['action_status']=1;}
                    }
                }
                elseif($_POST['config_type']=="update_doc_acc_verification"){
                    $multipleHandler['config_type'] = "update_doc_acc_verification";

                    $arr_result_submission = array("doc_error"=>array(), "doc_saved_to_db"=>0, "doc_send_via_email"=>0);

                    //SQLs
                    $sql_submit_doc = "UPDATE `user_verified` SET `doc` =?, `verified` =? WHERE `idUserFK` =?";
                    $stmt_submit_doc = $connection->prepare($sql_submit_doc);

                    $sql_get_email = "SELECT `username`, `email` FROM `user` INNER JOIN `user_profile` ON `user`.`idUser` = `user_profile`.`idUserFK` WHERE `idUser` =? AND `verification_email` =?";
                    $stmt_get_email = $connection->prepare($sql_get_email);

                    if(isset($_FILES['doc_file'])){
                        $errors= array();
                        $path = "../media/offDoc/";
                        $file_name = $path.date("Y_m_d_h_i_sa").basename($_FILES['doc_file']['name']);
                        $file_size =$_FILES['doc_file']['size'];
                        $file_tmp =$_FILES['doc_file']['tmp_name'];
                        $file_type=$_FILES['doc_file']['type'];
                        $file_ext=strtolower(pathinfo($file_name,PATHINFO_EXTENSION));
                        
                        $extensions= array("jpeg","jpg","png","pdf");
                        
                        if(in_array($file_ext,$extensions)=== false){
                           $errors[]="extension not allowed, please choose a JPEG or PNG or PDF file.";
                        }
                        
                        if($file_size >= 1572864){
                           $errors[]='File size too big.';
                        }
                        
                        if(empty($errors)==true){
                            
                           //Select Email to send than send
                           $stmt_get_email->execute([$_SESSION['idUser'], 1]);
                           if($stmt_get_email->rowCount()>0){
                                //Email found
                                $file_name = $file_name;
                                move_uploaded_file($file_tmp,$file_name);
                                //Add to database
                                $file_name_to_db = str_replace("../","", $file_name);
                                //Start transaction
                                $connection->beginTransaction();
                                //Insert to db
                                $stmt_submit_doc->execute([$file_name_to_db, 2, $_SESSION['idUser']]);
                                $arr_result_submission['doc_saved_to_db'] =1;

                                //Get email
                                $row_get_email = $stmt_get_email->fetch();
                                $arr_result_submission['email'] = $row_get_email['email'];
                            
                                //Require email sender library at the very top
                                $sender =$gsv_senderN1;
                                $senderTitle ="Zimaware INC.";
                                $receiver =$gsv_receiver_account_verification_N1;
                                $receiverTitle = $row_get_email['username']." Hello dear team member, this user is requesting account verification";
                                $subject = "ACCOUNT VERIFICATION REQUEST";
                                $body ='<p>This user is requesting account verification: '.$row_get_email['username'].'</p>';
                                $altbody ="alternate msg for account verification";
                                $emailResponse = sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altbody,  $arr_result_submission['email'], $file_name);
                                //Check if email has been sent
                                //$emailResponse['status'] == 1
                                $multipleHandler['divers_error'] = $emailResponse['status'];
                                if($emailResponse['status'] == 1){
                                    //If email is sent successfully send api response +
                                    $connection->commit();
                                    $arr_result_submission['doc_send_via_email'] =1;
                                    $multipleHandler['action_status']=1;
                                }
                                else{
                                    //If email not sent //Rollback //Unlink doc //Send api response -
                                    $connection->rollBack();
                                    $arr_result_submission['doc_saved_to_db'] =0;
                                    unlink($file_name);
                                }
                           }
                           
                
                        }else{
                            
                           $arr_result_submission['doc_error'] = $errors;

                        }
                    }
                    $APIResponse['arr_return'] =  $arr_result_submission;

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
