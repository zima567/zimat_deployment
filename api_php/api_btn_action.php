<?php
//Require email sender library at the very top
require("mailing.php");

//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);
//array_push($APIResponse, array()); // api_response[0] will contain status con, status query,

//Utilities variables
$queryError = array("query_error"=>"NONE");
$actionResult = array("status"=>0, "actionType"=>"NONE", "total"=>0, "action_error"=>"NONE", "divers_data"=>"NONE");
$errorMsg="";

//Post variables
//below inside conditions

if(isset($_SESSION['idUser']) && isset($_POST['actionType'])){
    //post variables here...
    $actionType = $_POST['actionType'];
    $actionDateTime = isset($_POST['actionDateTime'])? $_POST['actionDateTime'] : "0000-00-00 00:00:00";

    try{

        $sql_event_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_event_like = $connection->prepare($sql_event_like);

        $sql_add_event_like = "INSERT INTO `event_like` (`idEventFK`, `idLikerFK`, `likeDate`) VALUES(?,?,?)";
        $stmt_add_event_like = $connection->prepare($sql_add_event_like);

        $sql_remove_event_like = "DELETE FROM `event_like` WHERE `idEventFK` =? AND `idLikerFK` =?";
        $stmt_remove_event_like = $connection->prepare($sql_remove_event_like);

        $sql_all_like = "SELECT `idLikerFK` FROM `event_like` WHERE `idEventFK` =?";
        $stmt_all_like = $connection->prepare($sql_all_like);

        $sql_is_follower = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK` =? AND `idFollowerFK` =?";
        $stmt_is_follower = $connection->prepare($sql_is_follower);

        $sql_set_follower = "INSERT INTO `user_follower`(`idUserFK`, `idFollowerFK`, `followDate`) VALUES(?,?,?)";
        $stmt_set_follower = $connection->prepare($sql_set_follower);

        $sql_remove_follower = "DELETE FROM `user_follower` WHERE `idUserFK` =? AND `idFollowerFK` =?";
        $stmt_remove_follower = $connection->prepare($sql_remove_follower);

        $sql_all_follower = "SELECT `idFollowerFK` FROM `user_follower` WHERE `idUserFK` =?";
        $stmt_all_follower = $connection->prepare($sql_all_follower);


        if($actionType=="EVENT_LIKE" && isset($_POST['eventID'])){
            $eventID = $_POST['eventID'];
            //Handle like for event
            $actionResult['actionType'] = "EVENT_LIKE";
            //Test if user already like event
            $stmt_event_like->execute([$eventID, $_SESSION['idUser']]);
            if(!$stmt_event_like->rowCount()>0){
                //User haven't liked event yet
                $stmt_add_event_like->execute([$eventID, $_SESSION['idUser'], $actionDateTime]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 1;
            }
            else{
                //user have already liked this event
                //Automatically the unlike query will be executed
                $stmt_remove_event_like->execute([$eventID, $_SESSION['idUser']]);
                $stmt_all_like->execute([$eventID]);
                $actionResult['total'] = $stmt_all_like->rowCount();
                $actionResult['status'] = 2;
            }
        }
        elseif($actionType=="FOLLOW_UNFOLLOW" && isset($_POST['user_to_follow_unfollow'])){
            //Handle follow or unfollow
            $userCible = $_POST['user_to_follow_unfollow'];
            $stmt_is_follower->execute([$userCible, $_SESSION['idUser']]);
            if(!$stmt_is_follower->rowCount()>0){
                //follow this user
                $stmt_set_follower->execute([$userCible, $_SESSION['idUser'], $actionDateTime]);
                $stmt_all_follower->execute([$userCible]);
                $actionResult['total'] = $stmt_all_follower->rowCount();
                $actionResult['actionType'] = "FOLLOW";
                $actionResult['status'] = 1;
            }
            else{
                //Unfollow user
                $stmt_remove_follower->execute([$userCible, $_SESSION['idUser']]);
                $stmt_all_follower->execute([$userCible]);
                $actionResult['total'] = $stmt_all_follower->rowCount();
                $actionResult['actionType'] = "UNFOLLOW";
                $actionResult['status'] = 1;

            }

        }
        elseif($actionType=="REQUEST_EMAIL_VERIFICATION_LINK"){
            //Handle action send email verification link
            $actionResult['actionType'] = "REQUEST_EMAIL_VERIFICATION_LINK";

            //Select email of user online
            $email="";
            $username = "";
            $sql_user_email = "SELECT * FROM `user` WHERE `idUser` =?";
            $stmt_user_email = $connection->prepare($sql_user_email);

            $sql_save_code = "INSERT INTO `verification_code` (`idUserFK`, `code`, `type`) VALUES(?,?,?)";
            $stmt_save_code = $connection->prepare($sql_save_code);

            $stmt_user_email->execute([$_SESSION['idUser']]);
            if($stmt_user_email->rowCount()>0){
                $row_user_email = $stmt_user_email->fetch();
                $email = $row_user_email['email'];
                $username = $row_user_email['username'];
            }

            if($email!="" && $username!=""){
                //Send email using the given email
                //verification link
                function generate_random_code($length_of_code) {
                    return substr(bin2hex(random_bytes($length_of_code)),
                                                    0, $length_of_code);
                }
                $randomCode = generate_random_code(10);
                $verificationLink = "https://www.zimaccess.com/verification.php?z=".urlencode(base64_encode($email))."&i=".$randomCode;

                $sender =$gsv_senderN1;
                $senderTitle ="Zimaccess Team";
                $receiver =$email;
                $receiverTitle = $username." Welcome to our platform! We hope you have the best experience with us.";
                $subject = "Email confirmation";
                $body ='<!DOCTYPE html>
                <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                <style>
                    table, td, div, h1, p {
                    font-family: Arial, sans-serif;
                    }
                    @media screen and (max-width: 530px) {
                    .unsub {
                        display: block;
                        padding: 8px;
                        margin-top: 14px;
                        border-radius: 6px;
                        background-color: #555555;
                        text-decoration: none !important;
                        font-weight: bold;
                    }
                    .col-lge {
                        max-width: 100% !important;
                    }
                    }
                    @media screen and (min-width: 531px) {
                    .col-sml {
                        max-width: 27% !important;
                    }
                    .col-lge {
                        max-width: 73% !important;
                    }
                    }
                </style>
                </head>
                <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
                <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
                    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                    <tr>
                        <td align="center" style="padding:0;">
                    
                        <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                            <tr>
                            <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;">
                                <a href="#" style="text-decoration:none;"><img src="https://www.zimaccess.com/media/icons/zimaware_logo1.jpeg" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:30px;background-color:#ffffff;">
                                <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">Welcome to our platform!</h1>
                                <p style="margin:0;">We\'re thrilled to have you here! Get ready to dive into your new account.</p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:0;font-size:24px;line-height:28px;font-weight:bold;">
                                <a href="#" style="text-decoration:none;"><img src="https://www.zimaccess.com/media/icons/std_scan_bg2.webp" width="600" alt="" style="width:100%;height:auto;display:block;border:none;text-decoration:none;color:#363636;"></a>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:35px 30px 11px 30px;font-size:0;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);">
                            
                                <div class="col-lge" style="display:inline-block;width:100%;max-width:395px;vertical-align:top;padding-bottom:20px;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                                <p style="margin-top:0;margin-bottom:12px;">Thank you for choosing ZIMACCESS. First, you need to confirm your email address. Just press the button below.</p>
                                <p style="margin:0;"><a href="'.$verificationLink.'" style="background: #0275d8; text-decoration: none; padding: 10px 25px; color: #ffffff; border-radius: 4px; display:inline-block; mso-padding-alt:0;text-underline-color:#0275d8">Confirm Email</a></p>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:30px;font-size:24px;line-height:28px;font-weight:bold;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);">
                                <a href="#" style="text-decoration:none;"><img src="https://www.zimaccess.com/media/icons/std_forgot_pwd.jpg" width="540" alt="" style="width:100%;height:auto;border:none;text-decoration:none;color:#363636;"></a>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:30px;background-color:#ffffff;">
                                <p style="margin:0;">This is an auto-generated email. Please do not reply to this email.<br>
                                Cheers,<br>
                                Zimaccess team</p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;">
                                <p style="margin:0;font-size:14px;line-height:20px;">Copyright &reg; 2022 zimaccess. All rights reserved.<br><a class="unsub" href="https://wwww.zimaccess.com/lsrs_support.html" style="color:#cccccc;text-decoration:underline;">Reach to our support team</a></p>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    </table>
                </div>
                </body>
                </html>';

                $altbody ="Follow this link to verify your email address on our platform.";

                //Start transaction
                $connection->beginTransaction();
                //send email from here
                $emailResponse = sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altbody);
                //insert random code to db
                $type = "EMAIL";
                $stmt_save_code->execute([$_SESSION['idUser'], $randomCode, $type]);

                if($emailResponse['status'] == 1){
                    //email sent
                    $resultSignUp['email_verification_sent']= 1;
                    $connection->commit();
                    $actionResult['status'] = 1;
                    $actionResult['divers_data'] = $email;
                }
                else{
                    //email not sent
                    $resultSignUp['email_verification_sent']= 0;
                    $connection->rollBack();
                    $errorMsg = $emailResponse['error'];
                }
            }
            else{
                $errorMsg="USER_EMAIL_NOT_FOUND";
            }
        }
        else{
            //Action not handled
            $errorMsg ="ACTION_NOT_HANDLED";
        }

    }catch(PDOException $e){
        $queryError['query_error'] = $e->getMessage();
    }
}
else{

    $errorMsg = "USER_OFFLINE";
}

//Final merge
//Query error
$actionResult['action_error'] = $errorMsg;
$APIResponse = array_merge($APIResponse, array_merge($queryError, $actionResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);