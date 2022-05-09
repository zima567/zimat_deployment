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
                          <td style="padding:35px 30px 11px 30px;font-size:0;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);">
                         
                            <div class="col-lge" style="display:inline-block;width:100%;max-width:395px;vertical-align:top;padding-bottom:20px;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                              <p style="margin-top:0;margin-bottom:12px;"><h1>RESET CODE</h1></p>
                              <p style="margin-top:0;margin-bottom:12px;">You have requested a code in order to reset your password.<br>Please copy this code to the required field:<br><h2>'.$fourDigitRandomNumber.'</h2></h2></p>
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
                            <p style="margin:0;font-size:14px;line-height:20px;">&reg; zimaccess, All rights reserved<br><a class="unsub" href="www.zimaware.com" style="color:#cccccc;text-decoration:underline;">Reach to our support team</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </body>
            </html>';
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