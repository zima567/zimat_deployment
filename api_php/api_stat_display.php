<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
//$APIResponse = array();
$APIResponse = array("arr_status"=>array(), "api_return"=>array());

//Utilities variables
$multipleHandler = array("is_user_online"=>0, "query_error"=>"NONE", "divers_error"=>"NONE");

if(isset($_SESSION['idUser']) && isset($_POST['stat_type'])){
    $multipleHandler['is_user_online'] = 1;
    try{

        if($_POST['stat_type']=="WALLET"){

            //SQLs
            //All event create by user online
            $sql_user_events = "SELECT `idEvent`, `title`, `country`.`name` AS `location_country`, `cities`.`name` AS `location_city`, `location`, `dateTime`, `status` FROM ((`event` INNER JOIN `country` ON `event`.`location_country` = `country`.`idCountry`) INNER JOIN `cities` ON `event`.`location_city` = `cities`.`idCity`) WHERE `directorFK` =?";
            $stmt_user_events = $connection->prepare($sql_user_events);
            //Total ticket for this event id
            $sql_tot_ticket = "SELECT `totalTicket`, `qtSold` FROM `event_ticket_counter` WHERE `idEventFK` =?";
            $stmt_tot_ticket = $connection->prepare($sql_tot_ticket);

            //Total ticket scanned
            $sql_tot_scanned = "SELECT `idTicket` FROM `event_ticket` INNER JOIN `ticket_order` ON `event_ticket`.`idTicket` = `ticket_order`.`idTicketFK` WHERE `event_ticket`.`idEventFK` = ? AND `ticket_order`.`scanned` =?";
            $stmt_tot_scanned = $connection->prepare($sql_tot_scanned);

            //Event prices
            $sql_event_prices = "SELECT `idPrice`, `price`, `currency`, `onlinePayment`, `offlinePayment` FROM `event_pricing` WHERE `idEventFK` =?";
            $stmt_event_prices = $connection->prepare($sql_event_prices);

            //Number of ticket sold per price
            $sql_ticket_sold_per_price = "SELECT `idTicketFK` FROM `ticket_order` WHERE `idPriceFK` =?";
            $stmt_ticket_sold_per_price = $connection->prepare($sql_ticket_sold_per_price);

            //Total price of all ticket sold for that event //Make sure that one event can be sold only on one currency
            $sql_tot_price = "SELECT SUM(`price`) AS `event_capital` FROM ((`ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket`) INNER JOIN `event_pricing` ON `ticket_order`.`idPriceFK` = `event_pricing`.`idPrice`) WHERE `event_ticket`.`idEventFK` =?";
            $stmt_tot_price = $connection->prepare($sql_tot_price);

            //event agent: username->rights, total ticket sold, total ticket scanned for this event
            $sql_event_agent = "SELECT `idUser`, `username`, `sellingRight`, `scanningRight` FROM `event_agent` INNER JOIN `user` ON `event_agent`.`idAgentFK` = `user`.`idUser` WHERE `idEVentFK` =?";
            $stmt_event_agent = $connection->prepare($sql_event_agent);

            //-----
            $sql_agent_tot_sold = "SELECT `idTicketFK` FROM `ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket` WHERE `idAgentFK` =? AND `event_ticket`.`idEventFK` =?";
            $stmt_agent_tot_sold = $connection->prepare($sql_agent_tot_sold);

            //-----
            $sql_agent_tot_scanned = "SELECT `idTicketFK` FROM `ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket` WHERE `whoFK` =? AND `event_ticket`.`idEventFK` =?";
            $stmt_agent_tot_scanned = $connection->prepare($sql_agent_tot_scanned);

            //Commission fees per event
            $sql_commission_fee = "SELECT SUM(`commission`) AS `event_commission` FROM `ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket` WHERE `event_ticket`.`idEventFK` =?";
            $stmt_commission_fee = $connection->prepare($sql_commission_fee);

            //EXECUTION OF QUERIES
            //get user events
            $stmt_user_events->execute([$_SESSION['idUser']]);
            if($stmt_user_events->rowCount()>0){
                //User has event(s)
                //temp arr to store infos
                $temp_arr_api = array();
                while($row_user_events = $stmt_user_events->fetch()){
                    $event_unit = array("idEvent"=>$row_user_events['idEvent'],
                                        "title"=>$row_user_events['title'],
                                        "location_country"=>$row_user_events['location_country'],
                                        "location_city"=>$row_user_events['location_city'],
                                        "location"=>$row_user_events['location'],
                                        "dateTime"=>$row_user_events['dateTime'],
                                        "status"=>$row_user_events['status'],
                                        "total_ticket"=>0,
                                        "total_sold"=>0,
                                        "total_scanned"=>0,
                                        "prices"=>array(),
                                        "revenue"=>0,
                                        "agents"=>array(),
                                        "total_commission"=>0,
                                        "status_commission"=>"UNDEFINED");

                    //Get total ticket and total sold
                    $stmt_tot_ticket->execute([$row_user_events['idEvent']]);
                    if($stmt_tot_ticket->rowCount()>0){
                        //Ticket exist for this event
                        $row_tot_ticket = $stmt_tot_ticket->fetch();
                        $event_unit['total_ticket'] = $row_tot_ticket['totalTicket'];
                        $event_unit['total_sold'] =  $row_tot_ticket['qtSold'];
                    }

                    //Get total scanned
                    $stmt_tot_scanned->execute([$row_user_events['idEvent'], 1]);
                    if($stmt_tot_scanned->rowCount()>0){
                        $event_unit['total_scanned'] = $stmt_tot_scanned->rowCount();
                    }

                    //Get prices and total sold per price
                    $stmt_event_prices->execute([$row_user_events['idEvent']]);
                    if($stmt_event_prices->rowCount()>0){
                        //Price(s) is/are set for this event
                        $temp_arr_prices_qtTicket = array();
                        while($row_price = $stmt_event_prices->fetch()){
                            $priceQtTicket = array("price"=>$row_price['price'], "currency"=>$row_price['currency'], "onlinePayment"=>$row_price['onlinePayment'], "offlinePayment"=>$row_price['offlinePayment'], "qt_ticket_sold"=>0);
                            $stmt_ticket_sold_per_price->execute([$row_price['idPrice']]);
                            if($stmt_ticket_sold_per_price->rowCount()>0){
                               $priceQtTicket['qt_ticket_sold'] = $stmt_ticket_sold_per_price->rowCount();
                            }
                            array_push($temp_arr_prices_qtTicket, $priceQtTicket);
                        }
                        $event_unit['prices'] = $temp_arr_prices_qtTicket;
                    }

                    //Total revenue generated by event
                    $stmt_tot_price->execute([$row_user_events['idEvent']]);
                    if($stmt_tot_price->rowCount()>0){
                        //Ticket has been sold tot revenue >0
                        $row_tot_price = $stmt_tot_price->fetch();
                        $event_unit['revenue'] = $row_tot_price['event_capital'];
                    }

                    //Get infos about agents
                    $stmt_event_agent->execute([$row_user_events['idEvent']]);
                    if($stmt_event_agent->rowCount()>0){
                        //Event has agent(s)
                        $temp_arr_agents = array();
                        while($row_agent = $stmt_event_agent->fetch()){
                            $agentDetails = array("username"=>$row_agent['username'], "sellingRight"=>$row_agent['sellingRight'], "scanningRight"=>$row_agent['scanningRight'], "total_sold"=>0, "total_scanned"=>0);
                            
                            $stmt_agent_tot_sold->execute([$row_agent['idUser'], $row_user_events['idEvent']]);
                            if($stmt_agent_tot_sold->rowCount()>0){
                                $agentDetails['total_sold'] = $stmt_agent_tot_sold->rowCount();
                            }

                            $stmt_agent_tot_scanned->execute([$row_agent['idUser'], $row_user_events['idEvent']]);
                            if($stmt_agent_tot_scanned->rowCount()>0){
                                $agentDetails['total_scanned'] = $stmt_agent_tot_scanned->rowCount();
                            }
                            array_push($temp_arr_agents, $agentDetails);
                        }
                        $event_unit['agents'] = $temp_arr_agents;
                    }

                    //Get commission fee
                    $stmt_commission_fee->execute([$row_user_events['idEvent']]);
                    $row_fee = $stmt_commission_fee->fetch();
                    $event_unit['total_commission'] = $row_fee['event_commission'];

                    //Push complete info for one event
                    array_push($temp_arr_api, $event_unit);
                }
                $APIResponse['api_return'] = $temp_arr_api;
            }

        }
        else {
            $multipleHandler['divers_error'] = "stat_type_NOT_HANDLED";
        }

    }catch(PDOException $e){
        $multipleHandler['query_error'] = $e->getMessage();
    }
}
else{
    if(!isset($_SESSION['idUser'])){
        $multipleHandler['divers_error'] ="USER_OFFLINE";
    }
    else{
        $multipleHandler['divers_error'] ="POST_VAR_INCORRECT";
    }
}


//Final merge
//Query error
$arr_status = array_merge($con_status, $multipleHandler);
$APIResponse['arr_status'] = $arr_status;

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);
