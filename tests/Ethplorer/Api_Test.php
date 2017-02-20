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
        foreach($aMandatoryFields as $field){
            $this->assertTrue(
                isset($aResult[$field]),
                sprintf(
                    "Field {$field} not present in response:\n%s",
                    var_export($aResult, TRUE)
                )
            );
        }
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
}
