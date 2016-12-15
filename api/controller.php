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

class ethplorerController {
    protected $db;
    protected $command;
    protected $params = array();

    public function __construct(Ethplorer $es){
        $this->db = $es;
        $command = isset($_GET["cmd"]) ? $_GET["cmd"] : FALSE;
        if(!$command){
            $home = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
            $uri = $_SERVER["REQUEST_URI"];
            if(FALSE !== strpos($uri, "?")){
                $uri = substr($uri, 0, strpos($uri, "?"));
            }
            $commandStr = preg_replace("/^\//", "", substr($uri, strlen($home)));
            $aParts = explode("/", $commandStr);
            $command = $aParts[0];
            if(count($aParts) > 1){
                for($i=1; $i<count($aParts); $i++){
                    $this->params[] = $aParts[$i];
                }
            }
        }
        $this->command = $command;
    }

    public function getCommand(){
        return $this->command;
    }

    public function getParam($number, $default = NULL){
        return isset($this->params[$number]) ? $this->params[$number] : $default;
    }

    public function getRequest($name, $default = NULL){
        $result = filter_input(INPUT_GET, $name);
        return (FALSE !== $result) && (!is_null($result)) ? $result : $default;
    }

    protected function sendResult(array $result){
        echo json_encode($result);
        die();
    }

    protected function sendError($code, $message){
        $result = array(
            'error' => array(
                'code' => $code,
                'message' => $message
            )
        );
        $this->sendResult($result);
    }

    public function run(){
        if(method_exists($this, $this->getCommand())){
            if(!$this->db->checkAPIkey($this->getRequest('apiKey', FALSE))){
                $this->sendError(1, 'Invalid API key');
            }
            $result = call_user_func(array($this, $this->getCommand()));
            $this->sendResult($result);
        }
    }

    public function getTokenHistory(){
        $result = array(
            'operations' => array()
        );
        $address = $this->getParam(0, FALSE);
        if((FALSE !== $address) && (!$this->db->isValidAddress($address))){
            $this->sendError(104, 'Invalid address format');
        }
        $options = array(
            'address'   => $this->getParam(0, FALSE),
            'type'      => $this->getRequest('type', FALSE),
            'limit'     => min(abs((int)$this->getRequest('limit', 10)), 10),
            'timestamp' => (int)$this->getRequest('tsAfter', 0)
        );
        $operations = $this->db->getLastTransfers($options);
        if(is_array($operations) && count($operations)){
            for($i = 0; $i < count($operations); $i++){
                $operation = $operations[$i];
                $res = array(
                    'timestamp'         => $operation['timestamp'],
                    'transactionHash'   => $operation['transactionHash'],
                    'tokenInfo'         => $operation['token'],
                    'type'              => $operation['type'],
                    'value'             => $operation['value'],
                );
                if(isset($operation['address'])){
                    $res['address'] = $operation['address'];
                }
                if(isset($operation['from'])){
                    $res['from'] = $operation['from'];
                    $res['to'] = $operation['to'];
                }
                $result['operations'][] = $res;
            }
        }
        return $result;
    }
}