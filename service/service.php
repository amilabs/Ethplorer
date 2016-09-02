<?php
/*!
 * Copyright 2016 Everex https://everex.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require dirname(__FILE__) . '/lib/etherscan.php';

$es = Etherscan::db(require_once dirname(__FILE__) . '/config.php');

$data = isset($_GET["data"]) ? $_GET["data"] : false;

// Allow cross-domain ajax requests
header('Access-Control-Allow-Origin: *');

$result = array();
if(false !== $data){
    if($es->isValidAddress($data)){
        $result = $es->getAddressDetails($data);
    }elseif($es->isValidTransactionHash($data)){
        $result = $es->getTransactionDetails($data);
    }
}
echo json_encode($result);