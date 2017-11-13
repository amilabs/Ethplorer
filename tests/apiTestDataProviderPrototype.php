<?php

namespace apiTests;
require "vendor/autoload.php";

class apiTest extends \PHPUnit\Framework\EthplorerAPITestCase
{
    public function provider()
    {
        return [
            // ========================== getTokenInfo =========================================================
            // Success
            [
                'method' => 'getTokenInfo',
                'URL_params' => '0xB97048628DB6B661D4C2aA833e95Dbe1A905B280',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    // Must be converted to ->assertTrue(isset($result[field]))
                    ['type' => 'isset',    'fields' => ['address', 'totalSupply', 'holdersCount']],
                    // If type name starts with "!" - check with assertFalse instead of assertTrue should be used
                    ['type' => '!isset',   'fields' => ['error']],
                    ['fields' => 'address', 'equals' => '0xB97048628DB6B661D4C2aA833e95Dbe1A905B280'],
                 ]
            ],
            // Error: invalid address format
            [
                'method' => 'getTokenInfo',
                'URL_params' => '0xB97048628DB6B661D4C2aA833e95Dbe1A905B28',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset',   'fields' => ['error']],
                    ['fields' => 'error:code', 'equals' => 104],
                 ]
            ],
            // Error: address is not a token
            [
                'method' => 'getTokenInfo',
                'URL_params' => '0xB97048628DB6B661D4C2aA833e95Dbe1A905B281',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset',   'fields' => ['error']],
                    ['fields' => 'error:code', 'equals' => 150],
                 ]
            ],
            // Error: invalid API key (using iteration)
            [
                '_iterate' => [
                    'GET_params:apiKey' => ['Invalid Key', ' ', '', 0],
                ],
                'method' => 'getTokenInfo',
                'URL_params' => '0xB97048628DB6B661D4C2aA833e95Dbe1A905B281',
                'GET_params' =>  ['apiKey' => null],
                'asserts' => [
                    ['type' => 'isset',   'fields' => 'error'],
                    ['fields' => 'error:code', 'equals' => 1],
                 ]
            ],
            // ========================== getAddressInfo =========================================================
            // Success
            [
                'method' => 'getAddressInfo',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['address', 'ETH', 'countTxs']],
                    ['type' => '!isset',   'fields' => ['error']],
                    ['fields' => ['address'], 			'equals' => strtolower('0xd26114cd6EE289AccF82350c8d8487fedB8A0C07')],
                    ['fields' => ['contractInfo:creatorAddress'], 	'equals' => '0x140427a7d27144a4cda83bd6b9052a63b0c5b589'],
                    ['fields' => ['tokenInfo:address'], 		'equals' => '0xd26114cd6ee289accf82350c8d8487fedb8a0c07'],
                 ]
            ],
            // Success with token parameter
            [
                'method' => 'getAddressInfo',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey, 'token' => '0x49aec0752e68d0282db544c677f6ba407ba17ed7'],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['address', 'ETH', 'countTxs']],
                    ['fields' => ['address'], 				'equals' => strtolower('0xd26114cd6EE289AccF82350c8d8487fedB8A0C07')],
                    ['fields' => ['contractInfo:creatorAddress'], 	'equals' => '0x140427a7d27144a4cda83bd6b9052a63b0c5b589'],
                    ['fields' => ['tokenInfo:address'], 		'equals' => '0xd26114cd6ee289accf82350c8d8487fedb8a0c07'],

                    // Must be converted to ->assertEquals(1, count($result['tokens']))
                    ['fields' => ['tokens'], 'type' => 'count',		'equals' => 1],

                    // "int(0)" must be converted to integer value
                    ['fields' => ['tokens:int(0):tokenInfo:address'], 	'equals' => '0x49aec0752e68d0282db544c677f6ba407ba17ed7'],
                 ]
            ],
            // Errors: 
            
            // todo:

            // ========================== getTokenHistory =========================================================
            // Check limit
            [
                'method' => 'getTokenHistory',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey, 'limit' => 5],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['operations']],
                    ['type' => '!empty',   'fields' => ['operations']],
                    ['type' => '!isset',     'fields' => ['error']],
                    // Check that count($result['operations']) is in 1 - 5 range:
                    ['fields' => ['operations'], 'type' => 'count', 'gt' => 0], // > 0
                    ['fields' => ['operations'], 'type' => 'count', 'lt' => 6], // < 6
                    // Same check in a single string
                    ['fields' => ['operations'], 'type' => 'count', 'range' => (1, 5)], // 1 <= value <= 5
                 ]
            ],
            // Incorrect limit value
            [
                'method' => 'getTokenHistory',
                'description' => 'Check with incorrect limit value',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey, 'limit' => 'incorrect'],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['operations']],
                    ['type' => '!empty',   'fields' => ['operations']],
                    ['type' => '!isset',     'fields' => ['error']],
                    ['fields' => ['operations'], 'type' => 'count', 'range' => (1, 50)],
                 ]
            ],
            // Limit value below the range
            [
                'method' => 'getTokenHistory',
                'description' => 'Check with limit = 0',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey, 'limit' => 0],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['operations']],
                    ['type' => '!empty',   'fields' => ['operations']],
                    ['type' => '!isset',     'fields' => ['error']],
                    ['fields' => ['operations'], 'type' => 'count', 'range' => (1, 50)],
                 ]
            ],
            // Limit value above the range
            [
                'method' => 'getTokenHistory',
                'description' => 'Check with limit = 51',
                'URL_params' => '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
                'GET_params' =>  ['apiKey' => apiTest::APIKey, 'limit' => 51],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['operations']],
                    ['type' => '!empty',   'fields' => ['operations']],
                    ['type' => '!isset',     'fields' => ['error']],
                    ['fields' => ['operations'], 'type' => 'count', 'range' => (1, 50)],
                 ]
            ],

            // ========================== getTxInfo =========================================================
            // Success
            [
                'method' => 'getTxInfo',
                'URL_params' => '0x0bd079304c36ff6741382125e1ba4bd02cdd29dd30f7a08b8ccd9e801cbc2be3',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset',    'fields' => ['hash', 'timestamp', 'blockNumber', 'from', 'value', 'gasLimit', 'gasUsed']],
                    ['fields' => 'hash',    'equals' => '0x0bd079304c36ff6741382125e1ba4bd02cdd29dd30f7a08b8ccd9e801cbc2be3'],
                    ['fields' => 'gasUsed', 'equals' => 40843]
                 ]
            ],
            // Error: invalid tx
            [
                'method' => 'getTxInfo',
                'URL_params' => '0x0bd079304c36ff6741382125e1ba4bd02cdd29dd30f7a08b8ccd9e801cbc2be2',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset', 'fields' => 'error'],
                    ['fields' => 'error:code', 'equals' => 404],
                ]
            ],
            // Error: invalid tx format
            [
		'method' => 'getTxInfo',
                'description' => 'Checks tx format',
                'URL_params' => 'xx0bd079304c36ff6741382125e1ba4bd02cdd29dd30f7a08b8ccd9e801cbc2be2',
                'GET_params' =>  ['apiKey' => apiTest::APIKey],
                'asserts' => [
                    ['type' => 'isset', 'fields' => 'error'],
                    ['fields' => 'error:code', 'equals' => 102],
                ]
            ],
            // Error: invalid API key (using iteration)
            [
                '_iterate' => [
                    'GET_params:apiKey' => ['Invalid Key', ' ', '', 0],
                ],
		'method' => 'getTxInfo',
                'URL_params' => '0x0bd079304c36ff6741382125e1ba4bd02cdd29dd30f7a08b8ccd9e801cbc2be3',
                'GET_params' =>  ['apiKey' => null],
                'asserts' => [
                    ['type' => 'isset', 'fields' => ['error']],
                    ['fields' => ['error:code'], 'equals' => 1],
                ]
            ],
            /* .... */
        ];
    }
}
