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

    $sql_insert_verified = "INSERT INTO `user_verified` (`idUserFK`) VALUES(?)";
    $stmt5 = $connection->prepare($sql_insert_verified);

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
        //Initiate user_verified
        $stmt5->execute([$idInsertedUser]);
        $connection->commit();

        $resultSignUp['sign_up_success']= 1;

        //Send email using the given email
        //verification link
        function generate_random_code($length_of_code) {
            return substr(bin2hex(random_bytes($length_of_code)),
                                              0, $length_of_code);
        }
        $randomCode = generate_random_code(10);
        $verificationLink = "localhost/zimat_deployment/verification.php?z=".urlencode(base64_encode($email))."&i=".$randomCode;

        $sender =$gsv_senderN1;
        $senderTitle ="Zimaware INC.";
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
                        <a href="http://www.example.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a>
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
                        <a href="http://www.example.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/1200x800-2.png" width="600" alt="" style="width:100%;height:auto;display:block;border:none;text-decoration:none;color:#363636;"></a>
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
                        <a href="http://www.example.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/1200x800-1.png" width="540" alt="" style="width:100%;height:auto;border:none;text-decoration:none;color:#363636;"></a>
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
                        <p style="margin:0 0 8px 0;"><a href="http://www.facebook.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/facebook_1.png" width="40" height="40" alt="f" style="display:inline-block;color:#cccccc;"></a> <a href="http://www.twitter.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/twitter_1.png" width="40" height="40" alt="t" style="display:inline-block;color:#cccccc;"></a></p>
                        <p style="margin:0;font-size:14px;line-height:20px;">&reg; zimaccess, All rights reserved<br><a class="unsub" href="wwww.zimaware.com" style="color:#cccccc;text-decoration:underline;">Reach to our support team</a></p>
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
