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
$resultSignUp = array("sign_up_success"=>0, "email_verification_sent"=>0);

//POST variables
$email = $_POST['email'];
$username = $_POST['username'];
$password = $_POST['password'];
//echo password_hash($password, PASSWORD_DEFAULT);


try{
    //SQL queries
    $sql_email_username = "SELECT `idUser` FROM `user` WHERE `username` =? AND `email` =?";
    $stmt1 = $connection->prepare($sql_email_username);

    $sql_insert = "INSERT INTO `user` (`username`, `email`, `password`) VALUES(?,?,?)";
    $stmt2 = $connection->prepare($sql_insert);

    $sql_profile = "INSERT INTO `user_profile` (`idUserFK`) VALUES(?)";
    $stmt3 = $connection->prepare($sql_profile);

    $sql_random_code = "INSERT INTO `verification_code` (`idUserFK`, `code`, `type`) VALUES(?,?,?)";
    $stmt4 = $connection->prepare($sql_random_code);

    $stmt1->execute([$username, $email]);
    if(!$stmt1->rowCount()>0){

        //Start transaction
        $connection->beginTransaction();
        //Insert new record to user table
        $stmt2->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT)]);
        //Get last inserted user id
        $idInsertedUser = $connection->lastInsertId();
        //Initiate user_profile table
        $stmt3->execute([$idInsertedUser]);
        $connection->commit();

        $resultSignUp['sign_up_success']= 1;

        //Send email using the given email
        //verification link
        function generate_random_code($length_of_code) {
            return substr(bin2hex(random_bytes($length_of_code)),
                                              0, $length_of_code);
        }
        $randomCode = generate_random_code(10);
        $verificationLink = "localhost/zimat/verification.php?z=".urlencode(base64_encode($email))."&i=".$randomCode;

        $sender =$gsv_senderN1;
        $senderTitle ="Zimaware INC.";
        $receiver =$email;
        $receiverTitle = $username." Welcome to our platform! We hope you have the best experience with us.";
        $subject = "Email confirmation";
        $body ="<h1>Testing phase</h1><br><p>Please click on <a href='".$verificationLink."'>this link to verify your account</a></p>";
        $altbody ="Follow this link to verify your email address on our platform.";

        //Start transaction
        $connection->beginTransaction();
        //send email from here
        $emailResponse = sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altbody);
        //insert random code to db
        $type = "EMAIL";
        $stmt4->execute([$idInsertedUser, $randomCode, $type]);

        if($emailResponse['status'] == 1){
            //email sent
            $resultSignUp['email_verification_sent']= 1;
            $connection->commit();
        }
        else{
            //email not sent
            $resultSignUp['email_verification_sent']= 0;
            $connection->rollBack();
        }
    }
    
}catch(PDOException $e){
    $queryError['query_error'] = $e->getMessage();
    $connection->rollBack();
}

//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $resultSignUp));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);
