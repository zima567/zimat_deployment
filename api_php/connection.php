<?php
//Globals var
require("global_server_variables.php");
//db connection credentials
$host = $gsv_dbHostName;
$user = $gsv_dbUser;
$password = $gsv_dbPassword;
$dbname = $gsv_dbName;

//api associative array
$con_status = array("db_connection"=>"UNDEFINED", "dbcon_error"=>"NONE");

//Set DSN
$dsn = 'mysql:host='. $host. ';dbname='. $dbname;

//Create a PDO instance
try {
 $connection = new PDO($dsn, $user, $password);
// set the PDO error mode to exception
 $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//Set the PDO fetch mode to associative array
 $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

 $con_status['db_connection'] = "SUCCEED";

} catch(PDOException $e) {
    $con_status['db_connection'] = "FAILED";
    $con_status['dbcon_error'] = $e->getMessage();
  }

  //file output test
  //var_dump($con_status);