<?php

namespace Ethplorer\UnitTests;

use Exception;
use PHPUnit_Framework_TestCase;

/**
 * Ethplorer API test
 */
class Api_Test extends PHPUnit_Framework_TestCase{

    protected $url = 'https://api.ethplorer.io/';

    /**
     * @return void
     */
    public function setUp(){
        parent::setUp();
    }

    /**
     * @covers
     */
    public function testGetTokenInfo_OK(){
        $cmd = 'getTokenInfo';
        $testAddress = '0xFf71Cb760666Ab06aa73f34995b42dd4b85ea07b';
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey'));
        $this->assertTrue(
            is_array($aResult),
            sprintf(
                "Invalid response received:\n%s",
                var_export($aResult, TRUE)
            )
        );
        $aMandatoryFields = array("address", "name", "decimals", "symbol", "totalSupply", "owner", "totalIn", "totalOut", "holdersCount", "issuancesCount", "countOps");

        $this->checkArray($aResult, $aMandatoryFields);

        $this->assertEquals(strtolower($testAddress), $aResult['address']);
        $this->assertEquals('THBEX', $aResult['name']);
        $this->assertEquals("4", $aResult['decimals']);
        $this->assertEquals('THBEX', $aResult['symbol']);
    }

    /**
     * @covers
     */
    public function testGetTokenInfo_Errors(){
        $cmd = 'getTokenInfo';
        $testAddress = '0xFf71Cb760666Ab06aa73f34995b42dd4b85ea07b';
        $testAddresses = array(
            // address => error code
            '0xf3763c30dd6986b53402d41a8552b8f7f6a6089b'    => 150, // Contract, but not a token
            '0xf3763c30dd6986b53402d41a8552b8f7f6a6089c'    => 150, // Not a contract
            '0xff3763c30dd6986b53402d41a8552b8f7f6a6089c'   => 104, // Invalid address format
            'f3763c30dd6986b53402d41a8552b8f7f6a6089c'      => 104, // Invalid address format
        );
        foreach($testAddresses as $address => $code){
            $aResult = $this->rq($cmd, $address, array('apiKey' => 'freekey'));
            $this->assertTrue(
                is_array($aResult) && isset($aResult['error']) && is_array($aResult['error']),
                sprintf(
                    "Invalid response received:\n%s",
                    var_export($aResult, TRUE)
                )
            );
            $this->assertEquals($code, $aResult['error']['code']);
        }

        // No API Key
        $aResult = $this->rq($cmd, $testAddress);
        $this->assertEquals(1, $aResult['error']['code']);

        // Invalid API key
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey1'));
        $this->assertEquals(1, $aResult['error']['code']);

    }

    /**
     * @covers
     */
    public function testGetAddressInfo_OK(){
        $cmd = 'getAddressInfo';
        // Not a token, not a contract
        $testAddress = '0x01763c30dd6986b53402d41a8552b8f7f6a6089b';
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey'));
        $aMandatoryFields = array(
            "ETH", "ETH.balance", "ETH.totalIn", "ETH.totalOut",
            "address", "countTxs",
        );
        $this->checkArray($aResult, $aMandatoryFields);
        $this->assertEquals(strtolower($testAddress), $aResult['address']);

        // Not a token, but a contract
        $testAddress = '0xf3763c30dd6986b53402d41a8552b8f7f6a6089b';
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey'));
        $aMandatoryFields = array(
            "ETH", "ETH.balance", "ETH.totalIn", "ETH.totalOut",
            "address", "countTxs",
            "contractInfo", "contractInfo.creatorAddress", "contractInfo.transactionHash", "contractInfo.timestamp"
        );
        $this->checkArray($aResult, $aMandatoryFields);
        $this->assertEquals(strtolower($testAddress), $aResult['address']);
        $this->assertEquals("0xc2be1c765d622bcfa3ab30bedb508b633ab79217", $aResult['contractInfo']['creatorAddress']);
        $this->assertEquals("0xbccde49492ff509f9a162de06574e63bc4d2038b96a13ca5935c9c1e97a4278d", $aResult['contractInfo']['transactionHash']);
        $this->assertEquals(1474030125, $aResult['contractInfo']['timestamp']);

        // Token
        $testAddress = '0xFf71Cb760666Ab06aa73f34995b42dd4b85ea07b';
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey'));

        $aMandatoryFields = array(
            "ETH", "ETH.balance", "ETH.totalIn", "ETH.totalOut",
            "address", "contractInfo", "countTxs",
            "tokenInfo", "tokenInfo.address", "tokenInfo.name", "tokenInfo.decimals", "tokenInfo.totalSupply"
        );
        $this->checkArray($aResult, $aMandatoryFields);
        $this->assertEquals(strtolower($testAddress), $aResult['address']);
        $this->assertEquals('THBEX', $aResult['tokenInfo']['name']);
        $this->assertEquals("4", $aResult['tokenInfo']['decimals']);
        $this->assertEquals('THBEX', $aResult['tokenInfo']['symbol']);
    }

    /**
     * @covers
     */
    public function testGetAddressInfo_Errors(){
        $cmd = 'getAddressInfo';
        $testAddress = '0xFf71Cb760666Ab06aa73f34995b42dd4b85ea07b';

        // Invalid address format
        $aResult = $this->rq($cmd, str_replace('0x', 'xx', $testAddress));
        $this->assertEquals(1, $aResult['error']['code']);

        // No API Key
        $aResult = $this->rq($cmd, $testAddress);
        $this->assertEquals(1, $aResult['error']['code']);

        // Invalid API key
        $aResult = $this->rq($cmd, $testAddress, array('apiKey' => 'freekey1'));
        $this->assertEquals(1, $aResult['error']['code']);
    }

    /**
     * @covers
     */
    public function testGetTxInfo_OK(){
        $cmd = 'getTxInfo';
        // Token transaction with single operation
        $tx = '0x91D6024517497c5740e1d8a4786779c257caa6d852b7c7365a0368e0ab2ebf86';
        $aResult = $this->rq($cmd, $tx, array('apiKey' => 'freekey'));
        $aMandatoryFields = array("hash", "timestamp", "blockNumber", "confirmations", "success", "from", "to", "value", "input", "gasLimit", "gasUsed", "logs", "operations");
        $this->checkArray($aResult, $aMandatoryFields);
        $this->assertEquals(strtolower($tx), $aResult['hash']);
        // $this->assertEquals(strtolower($tx), $aResult['timestamp']);
        $this->assertEquals(2817933, $aResult['blockNumber']);
        $this->assertEquals(true, $aResult['success']);
        $this->assertEquals("0xcab65db421ec1afdfb3a18fedb82ba24142e5e45", $aResult['from']);
        $this->assertEquals("0x48c80f1f4d53d5951e5d5438b54cba84f29f32a5", $aResult['to']);
        $this->assertEquals(0, $aResult['value']);
        $this->assertEquals(63000, $aResult['gasLimit']);
        $this->assertEquals(37274, $aResult['gasUsed']);
        $this->assertEquals(1, $aResult['logs']);
        $this->assertEquals(1, $aResult['operations']);
    }

    /**
     * API request.
     *
     * @param type $cmd
     * @param type $subject
     * @param array $aParameters
     * @return type
     */
    protected function rq($cmd, $subject = '', array $aParameters = array()){
        $url = $this->url . $cmd;
        if($subject){
            $url = $url . '/' . $subject;
        }
        if(!empty($aParameters)){
            $url = $url . '?' . http_build_query($aParameters);
        }
        $json = file_get_contents($url);
        $aResult = json_decode($json, TRUE);
        return $aResult;
    }

    /**
     * Checks if array has all specified fields.
     *
     * @param array $aResult
     * @param array $aMandatoryFields
     */
    protected function checkArray(array $aResult, array $aMandatoryFields){
        foreach($aMandatoryFields as $field){
            $fieldOriginal = $field;
            if(FALSE !== strpos($field, '.')){
                $field = explode('.', $field);
            }
            $this->assertTrue(
                is_array($field) ? isset($aResult[$field[0]][$field[1]]) : isset($aResult[$field]),
                sprintf(
                    "Field {$fieldOriginal} not present in response:\n%s",
                    var_export($aResult, TRUE)
                )
            );
        }
    }
}
