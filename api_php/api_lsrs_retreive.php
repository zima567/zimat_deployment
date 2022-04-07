<?php
//Require email sender library at the very top
require("mailing.php");

//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$resultReset = array("option_status"=>0, "reset"=>0);

//POST variables
//$option = $_POST['option']; //required
//$email = $_POST['email']; //required
//$value = $_POST['value']; // it can be code or password value
//echo password_hash($password, PASSWORD_DEFAULT);

if(isset($_POST['option']) && isset($_POST['email'])){
    //If these two vars are set then you can procceed
    $option = $_POST['option']; //required
    $email = $_POST['email']; //required
    try{
        //SQL queries
        $sql_user_id = "SELECT `idUser`, `username` FROM `user` WHERE `email` =?";
        $stmt1 = $connection->prepare($sql_user_id);
    
        $sql_save_vc = "INSERT INTO `verification_code`(`idUserFK`, `code`, `type`) VALUES(?,?,?) ";
        $stmt2 = $connection->prepare($sql_save_vc);

        $sql_save_vcb = "UPDATE `verification_code` SET `code` =? WHERE `idUserFK` =? AND `type` =?";
        $stmt2b = $connection->prepare($sql_save_vcb);
    
        $sql_verify_code = "SELECT `idUserFK` FROM `verification_code` WHERE `idUserFK` =? AND `code` =? AND `type` =?";
        $stmt3 = $connection->prepare($sql_verify_code);

        $sql_verify_codeb = "SELECT `idUserFK` FROM `verification_code` WHERE `idUserFK` =? AND `type` =?";
        $stmt3b = $connection->prepare($sql_verify_codeb);
    
        $sql_reset = "UPDATE `user` SET `password` =? WHERE `email` =?";
        $stmt4 = $connection->prepare($sql_reset);
    
        //Important variables
        $stmt1->execute([$email]);
        $row_user_info = $stmt1->fetch();
    
        if($option =="SEND_CODE"){
            //send code to email-address and save code to db as type PASSWORD_RESET
            //Generate the code
            $fourDigitRandomNumber = mt_rand(1111,9999);
    
            //send Email
            $sender =$gsv_senderN1;
            $senderTitle ="Zimaware INC.";
            $receiver =$email;
            $receiverTitle = $row_user_info['username']." warm greetings from our team. You have requested password reset. Please user this code to continue the proccess.";
            $subject = "Password Reset";
            $body ="<h1>Testing phase</h1><br><p>Use this code for resseting your password: <h1>".$fourDigitRandomNumber."</h1></p>";
            $altbody ="Use this code to reset your password: ".$fourDigitRandomNumber;
    
            //Start transaction
            $connection->beginTransaction();
            //send email from here
            $emailResponse = sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altbody);
            //insert random code to db
            $type = "PASSWORD_RESET";
            $stmt3b->execute([$row_user_info['idUser'], $type]);
            if($stmt3b->rowCount()>0){
                $stmt2b->execute([$fourDigitRandomNumber, $row_user_info['idUser'], $type]);
            }
            else{
                $stmt2->execute([$row_user_info['idUser'], $fourDigitRandomNumber, $type]);
            }
    
            if($emailResponse['status'] == 1){
                //email sent
                $resultReset['option_status']= 1;
                $connection->commit();
            }
            else{
                //email not sent
                $resultReset['option_status']= 0;
                $connection->rollBack();
            }
    
        }
        elseif($option =="SUBMIT_CODE" && isset($_POST['value']) && $_POST['value']!="" ){
            $type = "PASSWORD_RESET";
            $code = $_POST['value'];

            $stmt3->execute([$row_user_info['idUser'], $code, $type]);
            if($stmt3->rowCount()>0){
                //user can reset password
                $resultReset['option_status']= 1;
            }
            else{
                //User cannot reset password
                $resultReset['option_status']= 0;
            }
        }
        elseif($option =="RESET_PASSWORD" && isset($_POST['value']) && $_POST['value']!="" ){
            $password = $_POST['value'];

            $stmt4->execute([password_hash($password, PASSWORD_DEFAULT), $email]);
            $resultReset['option_status']= 1;
            $resultReset['reset']= 1;
        }
        else{
            //option status false
            $resultReset['option_status']= 0;
        }
    }catch(PDOException $e){
        $queryError['query_error'] = $e->getMessage();
        $resultReset['option_status']= 0;
    }
}
else{
    //The two required/mendatory vars not set
    $queryError['query_error'] = "Mendatory variables not set in the request";
}



//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $resultReset));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);