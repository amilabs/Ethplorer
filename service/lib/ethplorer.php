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

require_once __DIR__ . '/cache.php';
require_once __DIR__ . '/profiler.php';

class Ethplorer {

    /**
     * Chainy contract address
     */
    const ADDRESS_CHAINY = '0xf3763c30dd6986b53402d41a8552b8f7f6a6089b';

    /**
     * Settings
     *
     * @var array
     */
    protected $aSettings = array();

    /**
     * MongoDB collections.
     *
     * @var array
     */
    protected $dbs;

    /**
     * Singleton instance.
     *
     * @var Ethplorer
     */
    protected static $oInstance;

    /**
     * Cache storage.
     *
     * @var evxCache
     */
    protected $oCache;

    /**
     * Constructor.
     *
     * @throws Exception
     */
    protected function __construct(array $aConfig){
        evxProfiler::checkpoint('START');
        $this->aSettings = $aConfig;
        $this->aSettings += array(
            "cacheDir" => dirname(__FILE__) . "/../cache/",
            "logsDir" => dirname(__FILE__) . "/../logs/",
        );

        $this->oCache = new evxCache($this->aSettings['cacheDir']);
        if(!isset($this->aSettings['ethereum'])){
            throw new Exception("Ethereum configuration not found");
        }
        if(isset($this->aSettings['mongo']) && (FALSE !== $this->aSettings['mongo'])){
            if(class_exists("MongoClient")){
                $oMongo = new MongoClient($this->aSettings['mongo']['server']);
                $oDB = $oMongo->{$this->aSettings['mongo']['dbName']};
                $this->dbs = array(
                    'transactions' => $oDB->{"everex.eth.transactions"},
                    'blocks'       => $oDB->{"everex.eth.blocks"},
                    'contracts'    => $oDB->{"everex.eth.contracts"},
                    'tokens'       => $oDB->{"everex.erc20.contracts"},
                    'operations'   => $oDB->{"everex.erc20.operations"},
                    'balances'     => $oDB->{"everex.erc20.balances"}
                );
                // Get last block
                $lastblock = $this->getLastBlock();
                $this->oCache->store('lastBlock', $lastblock);
            }else{
                throw new Exception("MongoClient class not found, php_mongo extension required");
            }
        }
    }

    /**
     * Singleton getter.
     *
     * @return Ethereum
     */
    public static function db(array $aConfig = array()){
        if(is_null(self::$oInstance)){
            self::$oInstance = new Ethplorer($aConfig);
        }
        return self::$oInstance;
    }

    /**
     * Returns true if provided string is a valid ethereum address.
     *
     * @param string $address  Address to check
     * @return bool
     */
    public function isValidAddress($address){
        return (is_string($address)) ? preg_match("/^0x[0-9a-f]{40}$/", $address) : false;
    }

    /**
     * Returns true if provided string is a valid ethereum tx hash.
     *
     * @param string  $hash  Hash to check
     * @return bool
     */
    public function isValidTransactionHash($hash){
        return (is_string($hash)) ? preg_match("/^0x[0-9a-f]{64}$/", $hash) : false;
    }

    /**
     * Returns true if provided string is a chainy contract address.
     *
     * @param type $address
     * @return bool
     */
    public function isChainyAddress($address){
        return ($address === self::ADDRESS_CHAINY);
    }

    /**
     * Returns advanced address details.
     *
     * @param string $address
     * @return array
     */
    public function getAddressDetails($address, $limit = 50){
        $result = array(
            "isContract"    => false,
            "balance"       => $this->getBalance($address),
            "transfers"     => array()
        );
        $contract = $this->getContract($address);
        $token = false;
        if($contract){
            $result['isContract'] = true;
            $result['contract'] = $contract;
            if($token = $this->getToken($address)){
                $result["token"] = $token;
            }elseif($this->isChainyAddress($address)){
                $result['chainy'] = $this->getChainyTransactions($limit);
            }
        }
        if($result['isContract'] && isset($result['token'])){
            $result["transfers"] = $this->getContractTransfers($address, $limit);
            $result["issuances"] = $this->getContractIssuances($address, $limit);
            if(empty($result["issuances"])){
                unset($result["issuances"]);
            }
        }
        if(!isset($result['token'])){
            // Get balances
            $result["tokens"] = array();
            $result["balances"] = $this->getAddressBalances($address);
            foreach($result["balances"] as $balance){
                $balanceToken = $this->getToken($balance["contract"]);
                if($balanceToken){
                    $result["tokens"][$balance["contract"]] = $balanceToken;
                }
            }
            $result["transfers"] = $this->getAddressOperations($address, $limit);
        }
        return $result;
    }

    public function getTokenTotalInOut($address){
        $t1 = microtime(true);
        $result = array('totalIn' => 0, 'totalOut' => 0);
        if($this->isValidAddress($address)){
            $cursor = $this->dbs['balances']->aggregate(
                array(
                    array('$match' => array("contract" => $address)),
                    array(
                        '$group' => array(
                            "_id" => '$contract',
                            'totalIn' => array('$sum' => '$totalIn'),
                            'totalOut' => array('$sum' => '$totalOut')
                        )
                    ),
                )
            );
            if($cursor){
                foreach($cursor as $record){
                    if(isset($record[0])){
                        if(isset($record[0]['totalIn'])){
                            $result['totalIn'] += floatval($record[0]['totalIn']);
                        }
                        if(isset($record[0]['totalOut'])){
                            $result['totalOut'] += floatval($record[0]['totalOut']);
                        }
                    }
                }
            }
        }
        return $result;
    }

    /**
     * Returns advanced transaction data.
     *
     * @param string  $hash  Transaction hash
     * @return array
     */
    public function getTransactionDetails($hash){
        $cache = 'tx-' . $hash;
        $result = $this->oCache->get($cache, false, true);
        if(false === $result){
            $tx = $this->getTransaction($hash);
            $result = array(
                "tx" => $tx,
                "contracts" => array()
            );
            if(isset($tx["creates"]) && $tx["creates"]){
                $result["contracts"][] = $tx["creates"];
            }
            $fromContract = $this->getContract($tx["from"]);
            if($fromContract){
                $result["contracts"][] = $tx["from"];
            }
            if(isset($tx["to"]) && $tx["to"]){
                $toContract = $this->getContract($tx["to"]);
                if($toContract){
                    if($token = $this->getToken($tx["to"])){
                        $result['token'] = $token;
                    }
                    $result["contracts"][] = $tx["to"];
                    $result["operations"] = $this->getOperations($hash);
                    if(is_array($result["operations"]) && count($result["operations"])){
                        foreach($result["operations"] as $idx => $operation){
                            if($result["operations"][$idx]['contract'] !== $tx["to"]){
                                $result["contracts"][] = $operation['contract'];
                            }
                            if($token = $this->getToken($operation['contract'])){
                                $result['token'] = $token;
                                $result["operations"][$idx]['type'] = ucfirst($operation['type']);
                                $result["operations"][$idx]['token'] = $token;
                            }
                        }
                        $result["contracts"] = array_values(array_unique($result["contracts"]));
                    }
                }
            }
            if($result['tx']){
                $this->oCache->save($cache, $result);
            }
        }
        if(is_array($result) && is_array($result['tx'])){
            $result['tx']['confirmations'] = $this->oCache->get('lastBlock') - $result['tx']['blockNumber'] + 1;
        }
        return $result;
    }

    /**
     * Return address ETH balance.
     *
     * @param string  $address  Address
     * @return double
     */
    public function getBalance($address){
        // evxProfiler::checkpoint('getBalance START [address=' . $address . ']');
        $balance = $this->_callRPC('eth_getBalance', array($address, 'latest'));
        if(false !== $balance){
            $balance = hexdec(str_replace('0x', '', $balance)) / pow(10, 18);
        }
        // evxProfiler::checkpoint('getBalance FINISH [address=' . $address . ']');
        return $balance;
    }

    /**
     * Return transaction data by transaction hash.
     *
     * @param string  $tx  Transaction hash
     * @return array
     */
    public function getTransaction($tx){
        // evxProfiler::checkpoint('getTransaction START [hash=' . $tx . ']');
        $cursor = $this->dbs['transactions']->find(array("hash" => $tx));
        $result = $cursor->hasNext() ? $cursor->getNext() : false;
        if($result){
            $receipt = isset($result['receipt']) ? $result['receipt'] : false;
            unset($result["_id"]);
            $result['gasLimit'] = $result['gas'];
            unset($result["gas"]);
            $result['gasUsed'] = $receipt ? $receipt['gasUsed'] : 0;
            $result['success'] = (($result['gasUsed'] < $result['gasLimit']) || ($receipt && !empty($receipt['logs'])));
        }
        // evxProfiler::checkpoint('getTransaction FINISH [hash=' . $tx . ']');
        return $result;
    }


    /**
     * Returns list of transfers in specified transaction.
     *
     * @param string  $tx  Transaction hash
     * @return array
     */
    public function getOperations($tx, $type = FALSE){
        // evxProfiler::checkpoint('getOperations START [hash=' . $tx . ']');
        $search = array("transactionHash" => $tx);
        if($type){
            $search['type'] = $type;
        }
        $cursor = $this->dbs['operations']->find($search)->sort(array('priority' => 1));
        $result = array();
        while($cursor->hasNext()){
            $res = $cursor->getNext();
            unset($res["_id"]);
            $res["success"] = true;
            $result[] = $res;
        }
        // evxProfiler::checkpoint('getOperations FINISH [hash=' . $tx . ']');
        return $result;
    }

    /**
     * Returns list of transfers in specified transaction.
     *
     * @param string  $tx  Transaction hash
     * @return array
     */
    public function getTransfers($tx){
        return $this->getOperations($tx, 'transfer');
    }

    /**
     * Returns list of issuances in specified transaction.
     *
     * @param string  $tx  Transaction hash
     * @return array
     */
    public function getIssuances($tx){
        return $this->getOperations($tx, array('$in' => array('issuance', 'burn', 'mint')));
    }

    /**
     * Returns list of known tokens.
     *
     * @param bool  $updateCache  Update cache from DB if true
     * @return array
     */
    public function getTokens($updateCache = false){
        $aResult = $updateCache ? false : $this->oCache->get('tokens', false, true);
        if(false === $aResult){
            $cursor = $this->dbs['tokens']->find()->sort(array("transfersCount" => -1));
            $aResult = array();
            foreach($cursor as $aToken){
                $address = $aToken["address"];
                unset($aToken["_id"]);
                $aResult[$address] = $aToken;
                $aResult[$address] += $this->getTokenTotalInOut($address);
            }
            $this->oCache->save('tokens', $aResult);
        }
        return $aResult;
    }

    /**
     * Returns token data by contract address.
     *
     * @param string  $address  Token contract address
     * @return array
     */
    public function getToken($address){
        // evxProfiler::checkpoint('getToken START [address=' . $address . ']');
        $aTokens = $this->getTokens();
        $result = isset($aTokens[$address]) ? $aTokens[$address] : false;
        if($result){
            unset($result["_id"]);
            if(!isset($result['decimals'])){
                $result['decimals'] = 0;
            }
            if(!isset($result['symbol'])){
                $result['symbol'] = "";
            }
            if(isset($result['txsCount'])){
                $result['txsCount'] = (int)$result['txsCount'] + 1;
            }
        }
        // evxProfiler::checkpoint('getToken FINISH [address=' . $address . ']');
        return $result;
    }

    /**
     * Returns contract data by contract address.
     *
     * @param string $address
     * @return array
     */
    public function getContract($address){
        // evxProfiler::checkpoint('getContract START [address=' . $address . ']');
        $cursor = $this->dbs['contracts']->find(array("address" => $address));
        $result = $cursor->hasNext() ? $cursor->getNext() : false;
        if($result){
            unset($result["_id"]);
            $result['txsCount'] = $this->dbs['transactions']->count(array("to" => $address)) + 1;
            if($this->isChainyAddress($address)){
                $result['isChainy'] = true;
            }
        }
        // evxProfiler::checkpoint('getContract FINISH [address=' . $address . ']');
        return $result;
    }

    /**
     * Returns total number of token operations for the address.
     *
     * @param string $address  Contract address
     * @return int
     */
    public function countOperations($address){
        $result = 0;
        $token = $this->getToken($address);
        if($token){
            $result = $this->dbs['operations']->count(array('contract' => $address));
        }
        return $result;
    }

    /**
     * Returns total number of transactions for the address (incoming, outoming, contract creation).
     *
     * @param string $address  Contract address
     * @return int
     */
    public function countTransactions($address){
        $result = 0;
        $result = $this
            ->dbs['transactions']
            ->count(array('$or' => array(array('from' => $address), array('to' => $address))));
        if($this->getContract($address)){
            $result++; // One for contract creation
        }
        return $result;
    }

    /**
     * Returns list of contract transfers.
     *
     * @param string $address  Contract address
     * @param int $limit       Maximum number of records
     * @return array
     */
    public function getContractTransfers($address, $limit = 10){
        return $this->getContractOperation('transfer', $address, $limit);
    }

    /**
     * Returns list of contract issuances.
     *
     * @param string $address  Contract address
     * @param int $limit       Maximum number of records
     * @return array
     */
    public function getContractIssuances($address, $limit = 10){
        return $this->getContractOperation(array('$in' => array('issuance', 'burn', 'mint')), $address, $limit);
    }

    /**
     * Returns last known mined block number.
     *
     * @return int
     */
    public function getLastBlock(){
        // evxProfiler::checkpoint('getLastBlock START');
        $cursor = $this->dbs['blocks']->find(array(), array('number' => true))->sort(array('number' => -1))->limit(1);
        $block = $cursor->getNext();
        // evxProfiler::checkpoint('getLastBlock FINISH');
        return $block && isset($block['number']) ? $block['number'] : false;
    }

    /**
     * Returns address token balances.
     *
     * @param string $address  Address
     * @param bool $withZero   Returns zero balances if true
     * @return array
     */
    public function getAddressBalances($address, $withZero = true){
        // evxProfiler::checkpoint('getAddressBalances START [address=' . $address . ']');
        $cursor = $this->dbs['balances']->find(array("address" => $address));
        $result = array();
        $fetches = 0;
        foreach($cursor as $balance){
            unset($balance["_id"]);
            // @todo: $withZero flag implementation
            $result[] = $balance;
            $fetches++;
        }
        // evxProfiler::checkpoint('getAddressBalances FINISH [address=' . $address . '] with ' . $fetches . ' fetches]');
        return $result;
    }

    /**
     * Returns list of transfers made by specified address.
     *
     * @param string $address  Address
     * @param int $limit       Maximum number of records
     * @return array
     */
    public function getLastTransfers(array $options = array()){
        // evxProfiler::checkpoint('getAddressTransfers START [address=' . $address . ', limit=' . $limit . ']');
        $search = array();
        if(!isset($options['type'])){
            $search['type'] = 'transfer';
        }else{
            if(FALSE !== $options['type']){
                $search['type'] = $options['type'];
            }
        }
        if(isset($options['address']) && !isset($options['history'])){
            $search['contract'] = $options['address'];
        }
        if(isset($options['address']) && isset($options['history'])){
            $search['$or'] = array(array('from' => $options['address']), array('to' => $options['address']), array('address' => $options['address']));
        }

        if(isset($options['token']) && isset($options['history'])){
            $search['contract'] = $options['token'];
        }

        $sort = array("timestamp" => -1);

        if(isset($options['timestamp']) && ($options['timestamp'] > 0)){
            $search['timestamp'] = array('$gt' => $options['timestamp']);
        }

        $cursor = $this->dbs['operations']
            ->find($search)
            ->sort($sort);

        if(isset($options['limit'])){
            $cursor = $cursor->limit((int)$options['limit']);
        }

        $result = array();
        $fetches = 0;
        foreach($cursor as $transfer){
            $token = $this->getToken($transfer['contract']);
            $transfer['token'] = $this->getToken($transfer['contract']);
            unset($transfer["_id"]);
            $result[] = $transfer;
            $fetches++;
        }
        // evxProfiler::checkpoint('getAddressTransfers FINISH [address=' . $address . '] with ' . $fetches . ' fetches]');
        return $result;
    }

    /**
     * Returns list of transfers made by specified address.
     *
     * @param string $address  Address
     * @param int $limit       Maximum number of records
     * @return array
     */
    public function getAddressOperations($address, $limit = 10){
        // evxProfiler::checkpoint('getAddressTransfers START [address=' . $address . ', limit=' . $limit . ']');
        $cursor = $this->dbs['operations']
            ->find(
                array(
                    '$or' => array(
                        array("from" => $address),
                        array("to" => $address),
                        array('address' => $address)
                    ),
                    'type' => array(
                        '$in' => array('transfer', 'issuance', 'burn', 'mint')
                    )
                )
            )
            ->sort(array("timestamp" => -1))
            ->limit($limit);
        $result = array();
        $fetches = 0;
        foreach($cursor as $transfer){
            unset($transfer["_id"]);
            $result[] = $transfer;
            $fetches++;
        }
        // evxProfiler::checkpoint('getAddressTransfers FINISH [address=' . $address . '] with ' . $fetches . ' fetches]');
        return $result;
    }

    public function checkAPIKey($key){
        return isset($this->aSettings['apiKeys']) && isset($this->aSettings['apiKeys'][$key]);
    }

    public function getAPIKeyDefaults($key, $option = FALSE){
        $res = FALSE;
        if($this->checkAPIKey($key)){
            if(is_array($this->aSettings['apiKeys'][$key])){
                if(FALSE === $option){
                    $res = $this->aSettings['apiKeys'][$key];
                }else if(isset($this->aSettings['apiKeys'][$key][$option])){
                    $res = $this->aSettings['apiKeys'][$key][$option];
                }
            }
        }
        return $res;
    }

    /**
     * Returns contract operation data.
     *
     * @param string $type     Operation type
     * @param string $address  Contract address
     * @param string $limit    Maximum number of records
     * @return array
     */
    protected function getContractOperation($type, $address, $limit){
        // evxProfiler::checkpoint('getContractOperation ' . $type . ' START [address=' . $address . ', limit=' . $limit . ']');
        $cursor = $this->dbs['operations']
            ->find(array("contract" => $address, 'type' => $type))
                ->sort(array("timestamp" => -1))
                ->limit($limit);
        $result = array();
        $fetches = 0;
        foreach($cursor as $transfer){
            unset($transfer["_id"]);
            $result[] = $transfer;
            $fetches++;
        }
        // evxProfiler::checkpoint('getContractOperation ' . $type . ' FINISH [address=' . $address . '] with ' . $fetches . ' fetches]');
        return $result;
    }

    /**
     * Returns last Chainy transactions.
     *
     * @param  int $limit  Maximum number of records
     * @return array
     */
    protected function getChainyTransactions($limit = 10){
        // evxProfiler::checkpoint('getChainyTransactions START [limit=' . $limit . ']');
        $result = array();
        $cursor = $this->dbs['transactions']
            ->find(array("to" => self::ADDRESS_CHAINY))
            ->sort(array("timestamp" => -1))
            ->limit($limit);
        $fetches = 0;
        foreach($cursor as $tx){
            $link = substr($tx['receipt']['logs'][0]['data'], 192);
            $link = preg_replace("/0+$/", "", $link);
            if((strlen($link) % 2) !== 0){
                $link = $link + '0';
            }
            $result[] = array(
                'hash' => $tx['hash'],
                'timestamp' => $tx['timestamp'],
                'input' => $tx['input'],
                'link' => $link,
            );
            $fetches++;
        }
        // evxProfiler::checkpoint('getChainyTransactions FINISH with ' . $fetches . ' fetches]');
        return $result;
    }

    /**
     * JSON RPC request implementation.
     *
     * @param string $method  Method name
     * @param array $params   Parameters
     * @return array
     */
    protected function _callRPC($method, $params = array()){
        $data = array(
            'jsonrpc' => "2.0",
            'id'      => time(),
            'method'  => $method,
            'params'  => $params
        );
        $result = false;
        $json = json_encode($data);
        $ch = curl_init($this->aSettings['ethereum']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($json))
        );
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json );
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $rjson = curl_exec($ch);
        if($rjson && (is_string($rjson)) && ('{' === $rjson[0])){
            $json = json_decode($rjson, JSON_OBJECT_AS_ARRAY);
            if(isset($json["result"])){
                $result = $json["result"];
            }
        }
        return $result;
    }

    /**
     * Store profile data on exit.
     */
    public function __destruct() {
        // evxProfiler::checkpoint('FINISH');
        // file_put_contents($this->aSettings['logsDir'] . '/profiler-' . microtime(true) . '.log', json_encode(evxProfiler::get(), JSON_PRETTY_PRINT));
    }
}