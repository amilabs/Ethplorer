<?php

namespace Ethplorer\UnitTests;

use Exception;
use PHPUnit_Framework_TestCase;

/**
 * Ethplorer API test
 */
class Api_Test extends PHPUnit_Framework_TestCase{

    /**
     * @return void
     */
    public function setUp(){
        parent::setUp();
    }

    /**
     * @covers
     */
    public function testCheckServerConfig(){
        $this->assertTrue(TRUE, TRUE);
    }
}
