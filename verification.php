<?php

//GLOBAL VARIABLES
$em=""; //error message
$vs=""; //verfication status

//Check GET variables
if(isset($_GET['z']) && isset($_GET['i'])){
    //connect to DB
    require ("api_php/connection.php");

    //The needed variables exist for email verification
    //Get variables
    $encode_email = $_GET['z'];
    $email = base64_decode(urldecode($_GET['z']));
    $randomeCode = $_GET['i'];

    //Utilities var
    $verifiedVar =1; $unverifiedVar = 0; $type ="EMAIL";

    try{
        $sql_gnrle = "SELECT `idUser` FROM `user` INNER JOIN `verification_code` ON `user`.`idUser` = `verification_code`.`idUserFK` WHERE `email` =? AND `code` =? AND `type` =?";
        $stmt1 = $connection->prepare($sql_gnrle);

        $sql_check_status = "SELECT `idUserFK` FROM `user_profile` WHERE `idUserFK` =? AND `verification_email` =?";
        $stmt2 = $connection->prepare($sql_check_status);

        $sql_verify = "UPDATE `user_profile` SET `verification_email` =? WHERE `idUserFK` =?";
        $stmt3 = $connection->prepare($sql_verify);

        //echo $email."<br>".$randomeCode;
        $stmt1->execute([$email, $randomeCode, $type]);
        if($stmt1->rowCount()>0){
            //This user has registered and can be verified
            $row_user_info = $stmt1->fetch();
            $stmt2->execute([$row_user_info['idUser'], $unverifiedVar]);
            if($stmt2->rowCount()>0){
                //This user is unverified thus can be verified
                $stmt3->execute([$verifiedVar, $row_user_info['idUser']]);
                $vs ="VERIFIED";
                header("Location:verification.html?m=".$vs);
                die(); 
            }
            else{
                //this user is already verified
                $vs ="ALREADY_VERIFIED";
                header("Location:verification.html?m=".$vs);
                die(); 
            }

        }
        else{
            //something went wrong, this user details are incoherent
            $em = "VARS_UNMATCHED_OR_NOT_EXIST";
            header("Location:verification.html?er=".$em);
            die(); 
        }


    }catch(PDOException $e){
        $em = $e->getMessage();
        header("Location:verification.html?er=".$em);
        die(); 
    }
}
else{
    //Needed variables don't exist
    $em ="GET_VARS_NOT_FOUND";
    header("Location:verification.html?er=".$em);
    die(); 
}
