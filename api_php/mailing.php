<?php
//Globals var
require("global_server_variables.php");

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require '../phpmailer/autoload.php';

function sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altBody, $replyTo="", $attachmentFile=""){
    //Array answer
    $returnArr = array("status"=>0, "error"=>"NONE");

    //Create an instance; passing `true` enables exceptions
    $mail = new PHPMailer(true);

    try {
        //Server settings
        //$mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
        $mail->isSMTP();                                            //Send using SMTP
        $mail->Host       = $GLOBALS['gsv_smtpHostName'];                     //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
        $mail->Username   = $GLOBALS['gsv_smtpUser'];                     //SMTP username
        $mail->Password   = $GLOBALS['gsv_smtpPassword'];                               //SMTP password
        $mail->SMTPSecure = $GLOBALS['gsv_smtpEncryption'];            //Enable implicit TLS encryption
        $mail->Port       = $GLOBALS['gsv_smtpPort'];                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

        //Recipients
        $mail->setFrom($sender, $senderTitle);
        $mail->addAddress($receiver, $receiverTitle);     //Add a recipient
        if($replyTo!=""){
            $mail->addReplyTo($replyTo, 'ZIMAT-TEAM');
        }

        if($attachmentFile!=""){
            $mail->addAttachment($attachmentFile);         //Add attachments
        }
        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = $altBody;

        $mail->send();
        $returnArr['status'] = 1;
        return $returnArr;
    } catch (Exception $e) {
        $returnArr['status'] = 0;
        $returnArr['error'] = $mail->ErrorInfo;

        return $returnArr;
    }

}