<?php
//Require email sender library at the very top
include("global_server_variables.php");
require("mailing.php");

//connect to DB
require ("connection.php");

//api response
$APIResponse = array();
$APIResponse = array_merge($APIResponse, $con_status);

//Utilities variables
$queryError = array("query_error"=>"NONE");
$resultSupport = array("option_name"=>"NONE", "support"=>0);

//Utilities functions
function isValidEmail($email){ 
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

//POST variables
//$support_type = $_POST['support_type']; //required
//$email = $_POST['email']; //required //required
//$support_msg = $_POST['support_msg']; 

if(isset($_POST['email']) && isValidEmail($_POST['email']) && isset($_POST['support_msg']) && isset($_POST['support_type']) ){
 //everything is set and correct to proceed
    try{
        
        //POST variables
        $support_type = $_POST['support_type']; //required
        $email = $_POST['email']; //required //required
        $support_msg = $_POST['support_msg'];

        //Queries
        $sql_save_request = "INSERT INTO `user_support` (`email`, `issue`, `support_type`) VALUES(?,?,?)";
        $stmt1 = $connection->prepare($sql_save_request);

        if($support_type == "DIVERS"){
            //send Email
            $sender = $gsv_senderN1; //I have to correct something here. Event though i change the email it is fixed to zimaware as the sender
            $senderTitle ="ZIMAWARE Customer - Request";
            $receiver =$gsv_receiverN1; //by default the receiver of request support will be zimaware@gmail.com
            $receiverTitle = "Our grettings dear team member. You have to help a potential customer of our platform";
            $subject = "Request for support";
            $body ="<h1>SUPPORT REQUEST</h1><br><p>Support request message: <br><p>".$support_msg."</p></p>";
            $altbody ="Support request message: ".$support_msg;

            //Start transaction
            $connection->beginTransaction();
            //send email from here
            $emailResponse = sendSimpleMail($sender, $senderTitle, $receiver, $receiverTitle, $subject, $body, $altbody, $email);
            //keep record of help request
            $stmt1->execute([$email, $support_msg, $support_type]);
        
            if($emailResponse['status'] == 1){
                //email sent
                $resultSupport['option_name']= $support_type;
                $resultSupport['support']= 1;
                $connection->commit();
            }
            else{
                //email not sent
                $resultSupport['option_name']= $support_type;
                $resultSupport['support']= 0;
                $connection->rollBack();
            }

        }
        else{
            //This support type is not handled
            $resultSupport['option_name']= $support_type;
            $resultSupport['support']= 0;
        }

    }catch(PDOException $e){
            $queryError['query_error'] = $e->getMessage();
            $resultSupport['support']= 0;
            $resultSupport['option_name']= $support_type;
    }
}
else{
    //something is not set
    $queryError['query_error'] = "Some required variables or not set or they are set incorrectly";
    $resultSupport['support']= 0;
}


//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $resultSupport));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);