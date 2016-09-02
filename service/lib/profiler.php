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

class evxProfiler {

    private static $aPoints = array();
    private static $starTs;
    private static $prevTs;

    public static function checkpoint($name){
        $now = microtime(true);
        if(!self::$starTs){
            self::$starTs = $now;
        }
        $diff = self::$prevTs ? ($now - self::$prevTs) : 0;
        $total = self::$starTs ? ($now - self::$starTs) : 0;
        self::$prevTs = $now;
        self::$aPoints[$name] = array(
            'timestamp' => $now,
            'diff'      => $diff,
            'total'     => $total
        );
    }
    public static function get(){
        return self::$aPoints;
    }
}
