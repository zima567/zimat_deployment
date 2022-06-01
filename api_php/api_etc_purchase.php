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
$purchaseResult = array("status"=>0, "error_msg"=>"NONE", "purchaseType"=>"NONE", "appended_user_found"=>0);
$commissionPercentage = 0.03;
$trueVAr = 1;
$falseVar =0;

//post variables
//Below inside try

if(isset($_SESSION['idUser']) && isset($_POST['eventID'])){
    //Get post variables
    $eventID = $_POST['eventID'];
    $nbrTicket = isset($_POST['nbrTicket'])? $_POST['nbrTicket'] : 1; 
    $orderDateTime = isset($_POST['orderDateTime']) ? $_POST['orderDateTime'] : "0000-00-00 00:00:00";
    $availablePaymentMethod = $_POST['onlinePayment'];

   //user is online and idEvent set
    try{
        //Sample error handling if developper did not set payment variable
        if(!isset($_POST['onlinePayment'])){
            throw new PDOException("Developement error: payment method was not set");
        }

        $sql_event_creator = "SELECT `directorFK` FROM `event` WHERE `idEvent` =?";
        $stmt_event_creator = $connection->prepare($sql_event_creator);

        $sql_payment_info = "SELECT * FROM `event_pricing` WHERE `idEventFK` =? ORDER BY `latestUpdate` DESC";
        $stmt_payment_info = $connection->prepare($sql_payment_info);

        $sql_ticket_not_sold = "SELECT `idTicket` FROM `event_ticket` WHERE `idEventFK` =? AND `sold` =?";
        $stmt_t_no_sold = $connection->prepare($sql_ticket_not_sold);

        $sql_update_sold_col = "UPDATE `event_ticket` SET `sold` =? WHERE `idTicket` =?";
        $stmt_update_sold_col = $connection->prepare($sql_update_sold_col);

        $sql_insert_t_order = "INSERT INTO `ticket_order` (`idTicketFK`, `idCustomerFK`, `securityCode`, `idPriceFK`, `commission`, `orderDate`, `idAgentFK`) VALUES(?,?,?,?,?,?,?)";
        $stmt_insert_t_order = $connection->prepare($sql_insert_t_order);

        $sql_verify_agent = "SELECT `idAgentFK` FROM `event_agent` WHERE `idAgentFK` =? AND `idEventFK` =? AND `sellingRight` =?";
        $stmt_verify_agent = $connection->prepare($sql_verify_agent);

        $sql_get_qtSold_col ="SELECT `qtSold` FROM `event_ticket_counter` WHERE `idEventFK` =?";
        $stmt_get_qtSold_col = $connection->prepare($sql_get_qtSold_col);

        $sql_update_counter = "UPDATE `event_ticket_counter` SET `qtSold` =? WHERE `idEventFK` =?";
        $stmt_update_counter = $connection->prepare($sql_update_counter);

        $stmt_t_no_sold->execute([$eventID, $falseVar]);
        if($stmt_t_no_sold->rowCount()>= $nbrTicket){
            //There is enough ticket
            $stmt_payment_info->execute([$eventID]);
            if($stmt_payment_info->rowCount()>0){
                //There is available price for this event and all infos as payment method is avai...
                //Function to generate security code
                function generateRandomString($length = 10) {
                    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    $charactersLength = strlen($characters);
                    $randomString = '';
                    for ($i = 0; $i < $length; $i++) {
                        $randomString .= $characters[rand(0, $charactersLength - 1)];
                    }
                    return $randomString;
                }
                
                $row_payment_info = $stmt_payment_info->fetch();
                if($row_payment_info['onlinePayment']==1){
                    //Online payment
                    $purchaseResult['purchaseType'] = "ONLINE";
                    //Get event directorFK
                    $stmt_event_creator->execute([$eventID]);
                    $row_director_event = $stmt_event_creator->fetch();

                    //Start a transaction
                    $connection->beginTransaction();
                    while(($row_t_no_sold = $stmt_t_no_sold->fetch()) && $nbrTicket>0){
                        
                        //Get commission per ticket
                        $commissionFee = number_format($row_payment_info['price'], 2,".","") * $commissionPercentage;
                        $securityCode = generateRandomString(5);
                        $stmt_update_sold_col->execute([$trueVAr, $row_t_no_sold['idTicket']]);
                        $stmt_insert_t_order->execute([$row_t_no_sold['idTicket'], $_SESSION['idUser'], $securityCode, $row_payment_info['idPrice'], $commissionFee, $orderDateTime, $row_director_event['directorFK']]);
                        --$nbrTicket;
                    }
                    
                    $stmt_get_qtSold_col->execute([$eventID]);
                    if($stmt_get_qtSold_col->rowCount()>0){
                        $row_qtSold = $stmt_get_qtSold_col->fetch();
                        $qtSold = intval($row_qtSold['qtSold']);
                        $qtSold = $qtSold +1;

                        $stmt_update_counter->execute([$qtSold, $eventID]);
                    }
                    else{
                        throw new PDOException("Something went wrong: Couldn't find a record in the event_ticket_counter table");
                    }
                     //Commit everything
                    $connection->commit();
                    $purchaseResult['status'] = 1;
                }
                else{
                    //Offline payment
                    $purchaseResult['purchaseType'] = "OFFLINE";
                    $stmt_verify_agent->execute([$_SESSION['idUser'], $eventID, $trueVAr]);
                    if($stmt_verify_agent->rowCount()>0){
                        //User online is an agent with selling right
                        //Start a transaction
                        $connection->beginTransaction();
                        $saveNbrTicket = $nbrTicket;
                        while(($row_t_no_sold = $stmt_t_no_sold->fetch()) && $nbrTicket>0){
                            /*$stmt_update_sold_col->execute([$trueVAr, $row_t_no_sold['idTicket']]);
                            $stmt_insert_t_order->execute([$row_t_no_sold['idTicket'], $_SESSION['idUser'], $row_payment_info['idPrice'], $orderDateTime, $_SESSION['idUser']]);
                            --$nbrTicket;*/
                            //Defauld user ticket append/ user online/ agent
                            $idUserAppended = $_SESSION['idUser'];
                            //Check if ticket has been append to a specific user
                            if(isset($_POST['user_ticket_append']) && $_POST['user_ticket_append']!="NONE"){
                                $sql_check_appended_user = "SELECT `idUser` FROM `user` WHERE `username` =?";
                                $stmt_appended_user = $connection->prepare($sql_check_appended_user);
                                $stmt_appended_user->execute([$_POST['user_ticket_append']]);
                                if($stmt_appended_user->rowCount()>0){
                                    //user exist
                                    $purchaseResult['appended_user_found'] = 1;
                                    $row_appended_user = $stmt_appended_user->fetch();
                                    $idUserAppended = $row_appended_user['idUser'];
                                }
    
                            }
                            else{
                                //Appended user is intentionnally set to default
                                $purchaseResult['appended_user_found'] = 2;
                            }

                            //Get commission per ticket
                            $commissionFee = number_format($row_payment_info['price'], 2,".","") * $commissionPercentage;
                            $securityCode = generateRandomString(5);
                            $stmt_update_sold_col->execute([$trueVAr, $row_t_no_sold['idTicket']]);
                            $stmt_insert_t_order->execute([$row_t_no_sold['idTicket'], $idUserAppended, $securityCode, $row_payment_info['idPrice'], $commissionFee, $orderDateTime, $_SESSION['idUser']]);
                            --$nbrTicket;
                        }

                        $stmt_get_qtSold_col->execute([$eventID]);
                        if($stmt_get_qtSold_col->rowCount()>0){
                            $row_qtSold = $stmt_get_qtSold_col->fetch();
                            $qtSold = intval($row_qtSold['qtSold']);
                            $qtSold = $qtSold +$saveNbrTicket;

                            $stmt_update_counter->execute([$qtSold, $eventID]);
                        }
                        else{
                            throw new PDOException("Something went wrong: Couldn't find a record in the event_ticket_counter table");
                        }

                        //Receice payment after all data has been entered into database
                        //Because we don't want to take people money without providing them our service
                        if($availablePaymentMethod){
                            //Take care of payment
                            //Get access to payment details from post methods
                            if(true){
                                //payment succeed
                            }
                            else{
                                //Payment failed
                                throw new PDOException("Payment failed: Couldn't procceed payment");
                            }
                        }
                        //Commit everything
                        $connection->commit();
                        $purchaseResult['status'] = 1;

                    }
                    else{
                        //User online is not an agent thus cannot sell ticket
                        $purchaseResult['error_msg'] = "NOT_AGENT";
                    }

                }
            }
            else{
                //No payment info for that event tickets
                $purchaseResult['error_msg'] = "NO_PAYMENT_INFOS";
            }
        }
        else{
            //There isn't enought ticket
            $purchaseResult['error_msg'] = "SOLD_OUT";
        }

    }catch(PDOException $e){
        $queryError['query_error'] = $e->getMessage();
        $connection->rollBack();
    }
}
else{
    //user is offline or idEvent not found
    $purchaseResult['error_msg'] = "USER_OFFLINE";
}


//Final merge
//Query error
$APIResponse = array_merge($APIResponse, array_merge($queryError, $purchaseResult));

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);

//Check if user is online and idEvent set
//Take event id to verify payment method

    //if payment method is online
    //verifiy if number ticket left match the purchase number
        //if yes, modifify the ticket(s) sold column
        //Add record to ticket order 
    
    //if payment method is offline
    //verify userOnline if it is agent with selling right
    //if yes, verify if number of ticket left match the purhase number
    //if yes, modify the ticket(s) sold column 
    //Add record to ticket order with reseller id to required column.