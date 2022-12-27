<?php
define( 'DB_NAME', 'u116309_aaa23' );
define( 'DB_USER', 'u116309_aaa23' );
define( 'DB_PASSWORD', 'aibery100' );
define( 'DB_HOST', 'localhost' );

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
setlocale(LC_ALL, 'ru_RU.utf8');

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
$data = $mysqli->query("SELECT number as number, name as name, object as object, zakaz as customer, FROM_UNIXTIME(konkurs_date_time) as time FROM `napominanie` WHERE FROM_UNIXTIME(konkurs_date_time) > CURDATE() AND FROM_UNIXTIME(konkurs_date_time) < CURDATE()+1 AND `name` NOT LIKE '%котир%' ORDER BY konkurs_date_time");
print_r(json_encode($data->fetch_all(MYSQLI_ASSOC)));
$mysqli->close();
?>