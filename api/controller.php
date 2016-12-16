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
    protected $apiCommands = array('getTxInfo', 'getTokenHistory', 'getAddressInfo', 'getTokenInfo');

    public function __construct($es){
        if(!($es instanceof Ethplorer)){
            $this->sendError(3, 'Database connection failed');
        }
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
        $command = $this->getCommand();
        if($command && in_array($command, $this->apiCommands) && method_exists($this, $command)){
            if(!$this->db->checkAPIkey($this->getRequest('apiKey', FALSE))){
                $this->sendError(1, 'Invalid API key');
            }
            $result = call_user_func(array($this, $this->getCommand()));
            $this->sendResult($result);
        }
    }

    public function getTokenInfo(){
        $address = $this->getParam(0, FALSE);
        if((FALSE === $address)){
            $this->sendError(103, 'Missing address');
        }
        if(!$this->db->isValidAddress($address)){
            $this->sendError(104, 'Invalid address format');
        }
        $result = $this->db->getToken($address);
        if($result && is_array($result)){
            unset($result['checked']);
            unset($result['txsCount']);
            unset($result['transfersCount']);
            $result['countOps'] = $this->db->countOperations($address);
        }else{
            $this->sendError(150, 'Address is not a token contract');
        }
        $this->sendResult($result);
    }

    public function getAddressInfo(){
        $address = $this->getParam(0, FALSE);
        $onlyToken = $this->getRequest('token', FALSE);
        if((FALSE === $address)){
            $this->sendError(103, 'Missing address');
        }
        $address = strtolower($address);
        if(!$this->db->isValidAddress($address)){
            $this->sendError(104, 'Invalid address format');
        }
        if($onlyToken && !$this->db->isValidAddress($onlyToken)){
            $this->sendError(104, 'Invalid address format');
        }
        $result = array(
            'address' => $address,
            'ETH' => array(
                'balance'   => $this->db->getBalance($address),
                'totalIn'   => 0,
                'totalOut'  => 0,
            ),
            'countTxs' => /* $this->db->countTransactions($address) */ 0
        );
        if($contract = $this->db->getContract($address)){
            $result['contractInfo'] = array(
                'code' => $contract['code'],
                'created' => array(
                    'creatorAddress' => $contract['creator'],
                    'transactionHash' => $contract['hash'],
                    'timestamp' => $contract['timestamp']
                )
            );
            if($token = $this->db->getToken($address)){
                unset($token['checked']);
                unset($token['txsCount']);
                unset($token['transfersCount']);
                $result['tokenInfo'] = $token;
            }
        }
        $balances = $this->db->getAddressBalances($address);
        if(is_array($balances) && !empty($balances)){
            $result['tokens'] = array();
            foreach($balances as $balance){
                if($onlyToken){
                    if($balance['contract'] !== strtolower($onlyToken)){
                        continue;
                    }
                }
                $token = $this->db->getToken($balance['contract']);
                if($token){
                    unset($token['checked']);
                    unset($token['txsCount']);
                    unset($token['transfersCount']);
                    $result['tokens'][] = array(
                        'tokenInfo' => $token,
                        'balance' => $balance['balance'],
                        'totalIn' => 0,
                        'totalOut' => 0
                    );
                }
            }
        }
        $this->sendResult($result);
    }

    public function getTxInfo(){
        $txHash = $this->getParam(0, FALSE);
        if((FALSE === $txHash)){
            $this->sendError(101, 'Missing transaction hash');
        }
        $txHash = strtolower($txHash);
        if(!$this->db->isValidTransactionHash($txHash)){
            $this->sendError(102, 'Invalid transaction hash format');
        }
        $tx = $this->db->getTransactionDetails($txHash);
        if(!is_array($tx) || (FALSE === $tx['tx'])){
            $this->sendError(404, 'Transaction not found');
        }
        $result = array(
            'hash'          => $txHash,
            'timestamp'     => $tx['timestamp'],
            'blockNumber'   => $tx['tx']['blockNumber'],
            'confirmations' => $this->db->getLastBlock() - $tx['tx']['blockNumber'] + 1,
            'success'       => $tx['tx']['success'],
            'from'          => $tx['tx']['from'],
            'to'            => $tx['tx']['to'],
            'value'         => $this->_bn2float($tx['tx']['value']),
            'input'         => $tx['tx']['input'],
            'gasLimit'      => $tx['tx']['gasLimit'],
            'gasUsed'       => $tx['tx']['gasUsed'],
            'logs'          => array(),
        );
        if(isset($tx['tx']) && !empty($tx['tx']['receipt']) && !empty($tx['tx']['receipt']['logs'])){
            foreach($tx['tx']['receipt']['logs'] as $log){
                $result['logs'][] = array(
                    'address'   => $log['address'],
                    'topics'    => $log['topics'],
                    'data'      => $log['data'],
                );
            }
        }
        $operations = $this->db->getOperations($txHash);
        if(is_array($operations) && !empty($operations)){
            foreach($operations as $i => $operation){
                $token = $this->db->getToken($operation['contract']);
                if($token && is_array($token)){
                    unset($token['checked']);
                    unset($token['txsCount']);
                    unset($token['transfersCount']);
                    $operations[$i]['tokenInfo'] = $token;
                }
                unset($operations[$i]['blockNumber']);
                unset($operations[$i]['success']);
                unset($operations[$i]['contract']);
            }
            $result['operations'] = $operations;
        }
        $this->sendResult($result);
    }

    public function getTokenHistory(){
        $result = array(
            'operations' => array()
        );
        $address = $this->getParam(0, FALSE);
        if($address){
            $address = strtolower($address);
        }
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

    protected function _bn2float($aNumber){
        $res = 0;
        if(isset($aNumber['c']) && !empty($aNumber['c'])){
            $str = '';
            for($i=0; $i<count($aNumber['c']); $i++){
                $str .= (string)$aNumber['c'][$i];
            }
            $res = floatval($str) / pow(10, 18);
        }
        return $res;
    }
}