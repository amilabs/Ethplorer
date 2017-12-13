<?php

if(isset($_GET["action"]) && ("getKitty" === $_GET["action"])){
  $id = isset($_GET["id"]) ? (int)$_GET["id"] : false;
  if($id){
      echo file_get_contents("https://api.cryptokitties.co/kitties/" . $id);
      die();
  }
}
echo '{"error":"Invalid Request"}';