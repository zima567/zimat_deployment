<?php
//start session 
session_start();

//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$eventCreationResult = array("status"=>0, "error_msg"=>"NONE", "posters_failed"=>"NONE", "idCreator"=>0);
$errorUpload="NONE";
$arrPosterToUpload = array();
$FILES_length = 0;


if(isset($_SESSION['idUser']) && $_SESSION['idUser']!=""){
    //user is online
    $eventCreationResult['idCreator'] = $_SESSION['idUser'];
    //Verified if user is certified in order to add payment on the platform*****************

    if(isset($_POST['title']) && $_POST['title']!="" && isset($_POST['location']) && $_POST['location'] && isset($_POST['dateTime']) && $_POST['dateTime']){
        //the minimun info for an event is available
        //Post Variables
        $title = $_POST['title'];
        $postMessage = isset($_POST['postMessage'])? $_POST['postMessage'] : ""; 
        $description = isset($_POST['description'])? $_POST['description'] : "";
        $location = $_POST['location'];
        $dateTime = $_POST['dateTime'];
        $arrCateg = isset($_POST['arrCateg'])? $_POST['arrCateg'] : array();
        //$arrCateg = array("Daniel", "wawa");
        $nbrTicket = isset($_POST['nbrTicket'])? $_POST['nbrTicket'] : 0;
        $ticketPrice = isset($_POST['ticketPrice'])? $_POST['ticketPrice'] : 0;
        $currency = isset($_POST['currency'])? $_POST['currency'] : "";
        $paymentMethode = isset($_POST['paymentMethod'])? $_POST['paymentMethod'] : "";
        $postDateTime = isset($_POST['postDateTime'])? $_POST['postDateTime'] : "0000-00-00 00:00:00";

        //If there is posters for that event
        if(isset($_FILES['posters'])){
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
                    $targetFilePath = $targetDir . $fileName; 
                     
                    // Check whether file type is valid 
                    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION); 
                    if(in_array($fileType, $allowTypes)){ 
                        if($_FILES["posters"]["size"][$key] <= 800000){
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

                $eventCreationResult['posters_failed'] = $errorUpload;
            } 
         //ancient if   
        }
    
        //Event status
        $status = "SCHEDULED";
        //UserId from session
        $userId = $_SESSION['idUser'];
        $userVerified = isset($_SESSION['verified'])? $_SESSION['verified'] : 0;
        $minQuota = 50;
        $falseVar = 0;
        $trueVar =1;
    
        try{
            //Queries
            //Think about adding a transaction for the queries*********
            $sql_insert_event = "INSERT INTO `event` (`title`, `postMessage`, `description`, `location`, `dateTime`, `status`, `directorFK`,`postDateTime`) VALUES(?,?,?,?,?,?,?,?)";
            $stmt1 = $connection->prepare($sql_insert_event);

            $sql_insert_posters = "INSERT INTO `event_poster`(`linkToPoster`, `dateUploaded`, `idEventFK`) VALUES(?,?,?)";
            $stmt2 = $connection->prepare($sql_insert_posters);

            $sql_insert_categ = "INSERT INTO `event_categ` (`idCategFK`, `idEventFK`) VALUES(?,?)";
            $stmt3 = $connection->prepare($sql_insert_categ);

            $sql_get_categ_id = "SELECT `idCategory` FROM `category` WHERE `title` =?";
            $stmt3b = $connection->prepare($sql_get_categ_id);

            $sql_create_ticket = "INSERT INTO `event_ticket` (`ticketHash`, `sold`, `idEventFK`) VALUES(?,?,?)";
            $stmt4 = $connection->prepare($sql_create_ticket);

            $sql_set_price ="INSERT INTO `event_pricing` (`price`, `currency`, `onlinePayment`, `offlinePayment`, `latestUpdate`, `idEventFK`) VALUES(?,?,?,?,?,?)";
            $stmt5 = $connection->prepare($sql_set_price);

            $sql_counter_ticket = "INSERT INTO `event_ticket_counter`(`idEventFK`, `totalTicket`, `qtSold`, `totalTicketOrigin`) VALUES(?,?,?,?)";
            $stmt6 = $connection->prepare($sql_counter_ticket);

            $sql_set_main_agent = "INSERT INTO `event_agent` (`idAgentFK`,`idEventFK`, `sellingRight`, `scanningRight`) VALUES(?,?,?,?)";
            $stmt7 = $connection->prepare($sql_set_main_agent);

            //Start a transaction
            $connection->beginTransaction();
            //Insert event
            $stmt1->execute([$title, $postMessage, $description, $location, $dateTime, $status, $userId, $postDateTime]);
            //Get last inserted event id
            $idInsertedEvent = $connection->lastInsertId();

            //Insert event posters
            if($FILES_length!=0){
                //There is file pictures/posters to upload
                if($FILES_length === count($arrPosterToUpload)){
                    //All the image files has been uploaded to server
                    foreach($arrPosterToUpload as $arrToDb){
                        $stmt2->execute([$arrToDb['target'], $postDateTime, $idInsertedEvent]); 
                    }
                }
                else{

                    foreach($arrPosterToUpload as $arr){
                        unlink($arr["target"]);
                    }
                    throw new PDOException("The images uploaded did not meet requirements");  
                }
            }

            //insert categories
            if(count($arrCateg)!==0){
                foreach($arrCateg as $title_categ){
                    $stmt3b->execute([$title_categ]);
                    if($stmt3b->rowCount()>0){
                        $row_id_categ = $stmt3b->fetch();
                        $stmt3->execute([$row_id_categ['idCategory'], $idInsertedEvent]);
                    }
                }
            }

            //Create ticket hash code
            if($nbrTicket!=0){
                //Ticket hash need to be created
                if($nbrTicket<=$minQuota || ($nbrTicket>50 && $userVerified)){
                    //This user can create more than minQuota
                    //Concatinate userID and eventID
                    $concat_ids = $userId.$idInsertedEvent."_";

                    //Encryption code
                    // Store the cipher method
                    $ciphering = "AES-128-CTR";
                    
                    // Use OpenSSl Encryption method
                    $iv_length = openssl_cipher_iv_length($ciphering);
                    $options = 0;
                    
                    // Non-NULL Initialization Vector for encryption
                    $encryption_iv = '1234567891011121';
                    
                    // Store the encryption key
                    $encryption_key = "zimaware_M6_WC";

                    for($i=0; $i<$nbrTicket;$i++){
                        $randomCode = bin2hex(random_bytes(10));
                        $concat_ids_randomCode = $concat_ids.$randomCode;

                        // Use openssl_encrypt() function to encrypt the data
                        $ticket_encryption = openssl_encrypt($concat_ids_randomCode, $ciphering, $encryption_key, $options, $encryption_iv);
                        // Display the encrypted string
                        //echo "<br>"."Encrypted String: " . $encryption . "\n";
                        $stmt4->execute([$ticket_encryption, $falseVar, $idInsertedEvent]);
                    }

                    //Initialize ticket_counter
                    $qt=0;
                    $stmt6->execute([$idInsertedEvent, $nbrTicket, $qt, $nbrTicket]);

                }else{
                    throw new PDOException("ticket: cannot create more than min quota, verify your account"); 
                }
            }

    
            //Insert event Price if set
            if($ticketPrice!=0 && $currency!="" && $paymentMethode!=""){
                //Save the price
                $offlineVar = 1;
                $onlineVar =0;
                $ticketPrice = (float) $ticketPrice;

                if($paymentMethode=="ONLINE"){
                    $offlineVar = 0;
                    $onlineVar =1;
                }

                $stmt5->execute([$ticketPrice, $currency, $onlineVar, $offlineVar, $postDateTime, $idInsertedEvent]);
            }
           
            //insert event main agent
            $stmt7->execute([$userId, $idInsertedEvent, $trueVar, $trueVar]);

            //Commit everything
            $connection->commit();
            $eventCreationResult['status'] = 1;
        }catch(PDOException $e){
            $queryError['query_error'] = $e->getMessage();
            $connection->rollBack();
           // unlink($_FILES['posters']['name'][$key]);
        }
    }
    else{
        //Required field is not set
        $eventCreationResult['error_msg'] = "Required field(s) not properly set";
    }
}
else{
    //user is offline
    $eventCreationResult['error_msg'] = "No user online";
}

//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $eventCreationResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);