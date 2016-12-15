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
    protected $command;
    protected $params = array();

    public function __construct(){
        $command = isset($_GET["cmd"]) ? $_GET["cmd"] : false;
        if(!$command){
            $home = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
            $commandStr = preg_replace("/^\//", "", substr($_SERVER["REQUEST_URI"], strlen($home)));
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

    public function getParam($number, $default = null){
        return isset($this->params[$number]) ? $this->params[$number] : $default;
    }
}