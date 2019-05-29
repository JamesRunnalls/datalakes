<?php 
$csv1 = array_map('str_getcsv', file($_POST['id1']));
$csv2 = array_map('str_getcsv', file($_POST['id2']));
echo json_encode([$csv1,$csv2]);
?>