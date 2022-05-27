<?php
//Start session in this script
session_start();
//connect to DB
require ("connection.php");

//api response
$APIResponse = array("arr_status"=>array());
//Utilities variables
$arrError = array("query_error"=>"NONE", "divers_error"=>"NONE", "family_suggest"=>"NONE", "family_suggest_is_handled"=>0);
$arrayCountries = array();
$arrayCities = array();
$arrayCateg = array();
$arrayListCurrencies = array();

try{
    if(isset($_POST['family_suggest']) && isset($_POST['query_data'])){
        $arrError['family_suggest'] = $_POST['family_suggest'];
        if($_POST['family_suggest'] == "COUNTRY_CITY"){
            $arrError['family_suggest_is_handled'] = 1;

            //SQLs Countries & cities
            $sql_all_countries = "SELECT `idCountry`, `name`, `currencyCode`, `currencyName`, `language`, `isFederation` FROM `country` INNER JOIN `currency` ON `country`.`idCurrencyFK`=`currency`.`idCurrency` WHERE `country`.`name` LIKE ? OR `country`.`name` LIKE ? OR `country`.`name` LIKE ?";
            $stmt_all_countries = $connection->prepare($sql_all_countries);

            $sql_id_country = "SELECT `idCountry` FROM `country` WHERE `name` =?";
            $stmt_id_country = $connection->prepare($sql_id_country);

            $sql_specific_cities = "SELECT * FROM `cities` WHERE `idCountryFK` =? AND (`name` LIKE ? OR `name` LIKE ? OR `name` LIKE ?)";
            $stmt_specific_cities = $connection->prepare($sql_specific_cities);


            if(!isset($_POST['countryName'])){

                $query1 = $_POST['query_data']."%";
                $query2 = "%".$_POST['query_data'];
                $query3 = "%".$_POST['query_data']."%";

                $stmt_all_countries->execute([$query1, $query2, $query3]);
                if($stmt_all_countries->rowCount()>0){
                    while($row_all_countries = $stmt_all_countries->fetch()){
                        array_push($arrayCountries, array("idCountry"=>$row_all_countries['idCountry'],
                                                        "name"=>$row_all_countries['name'],
                                                        "currencyCode"=>$row_all_countries['currencyCode'],
                                                        "currencyName"=>$row_all_countries['currencyName'],
                                                        "language"=>$row_all_countries['language'],
                                                        "isFederation"=>$row_all_countries['isFederation']));
                    }
                }

            }
            elseif(isset($_POST['countryName'])){
                $stmt_id_country->execute([$_POST['countryName']]);
                if($stmt_id_country->rowCount()>0){

                    $row_id_country = $stmt_id_country->fetch();
                    array_push($arrayCities, array("idCountry"=>$row_id_country['idCountry'], "countryName"=>$_POST['countryName']));

                    $query1 = $_POST['query_data']."%";
                    $query2 = "%".$_POST['query_data'];
                    $query3 = "%".$_POST['query_data']."%";

                    $stmt_specific_cities->execute([$row_id_country['idCountry'], $query1, $query2, $query3]);
                    if($stmt_specific_cities->rowCount()>0){
                        while($row_cities = $stmt_specific_cities->fetch()){
                            array_push($arrayCities, array("idCity"=>$row_cities['idCity'],
                                                        "name"=>$row_cities['name']));
                        }
                    }
                }
                else{
                    $arrError['divers_error'] = "Country name unknown or not supported"; 
                }
                
            }

        }
        elseif($_POST['family_suggest'] == "EVENT_CATEGORIES"){
            $arrError['family_suggest_is_handled'] = 1;
            //SQLs get categories
            $sql_cateogories = "SELECT * FROM `category`";
            $stmt_categories = $connection->prepare($sql_cateogories);

            $stmt_categories->execute();
            if($stmt_categories->rowCount()>0){
                while($row_categories = $stmt_categories->fetch()){
                    array_push($arrayCateg, array("idCategory"=>$row_categories['idCategory'],
                                                  "title"=>$row_categories['title']));
                }
            }
        }
        elseif($_POST['family_suggest'] =="TICKET_CURRENCY" && isset($_POST['countryName'])){
            $arrError['family_suggest_is_handled'] = 1;
            //SQLs get currencies
            $sql_nation_currency = "SELECT `idCurrency`, `currencyCode`, `currencyName` FROM `country` INNER JOIN `currency` ON `country`.`idCurrencyFK`=`currency`.`idCurrency` WHERE `country`.`name` =?";
            $stmt_nation_currency = $connection->prepare($sql_nation_currency);

            $sql_list_more_currency = "SELECT `idCurrency`, `currencyCode`, `currencyName` FROM `currency` WHERE `idCurrency` <>?";
            $stmt_list_more_currency = $connection->prepare($sql_list_more_currency);

            $stmt_nation_currency->execute([$_POST['countryName']]);
            if($stmt_nation_currency->rowCount()>0){
                $row_nation_currency = $stmt_nation_currency->fetch();
                array_push($arrayListCurrencies,array("idCurrency"=>$row_nation_currency['idCurrency'],
                                                      "currencyCode"=>$row_nation_currency['currencyCode'],
                                                      "currencyName"=>$row_nation_currency['currencyName']));
                
                $stmt_list_more_currency->execute([$row_nation_currency['idCurrency']]);
                if($stmt_list_more_currency->rowCount()>0){
                    while($row_more_currency = $stmt_list_more_currency->fetch()){
                        array_push($arrayListCurrencies, array("idCurrency"=>$row_more_currency['idCurrency'],
                                                               "currencyCode"=>$row_more_currency['currencyCode'],
                                                               "currencyName"=>$row_more_currency['currencyName']));
                    }
                }
            }
            else{
                array_push($arrayListCurrencies,array("idCurrency"=>0,
                                                      "currencyCode"=>"NONE",
                                                      "currencyName"=>"NONE"));
            }

        }
        else{
            $arrError['divers_error'] = "Family_suggest not handle"; 
        }
    
    }
    else{
        $arrError['divers_error'] = "Family_suggest must be set in request and data_query variable";
    }
   
}catch(PDOException $e){
    $arrError['query_error'] = $e->getMessage();
}



//Final merge
//Query error
$arr_status = array_merge($con_status, $arrError);
$APIResponse['arr_status'] = $arr_status;
if($arrError['family_suggest_is_handled']){
    if($arrError['family_suggest']=="COUNTRY_CITY"){
        $temp_arr_API = array("arr_countries"=>$arrayCountries, "arr_cities"=>$arrayCities);
        $APIResponse = array_merge($APIResponse, $temp_arr_API);
    }
    elseif($arrError['family_suggest']=="EVENT_CATEGORIES"){
        $temp_arr_API = array("arr_categ"=>$arrayCateg);
        $APIResponse = array_merge($APIResponse, $temp_arr_API);
    }
    elseif($arrError['family_suggest']="TICKET_CURRENCY"){
        $temp_arr_API = array("arr_currencies"=>$arrayListCurrencies);
        $APIResponse = array_merge($APIResponse, $temp_arr_API);
    }
}

//var_dump($APIResponse);
header('Content-type:application/json');
echo json_encode($APIResponse);
