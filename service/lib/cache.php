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

/**
 * Cache class.
 */
class evxCache {
    /**
     * Cache storage.
     *
     * @var array
     */
    protected $aData = array();

    /**
     * Cache files path.
     *
     * @var string
     */
    protected $path;

    /**
     * Constructor.
     *
     * @param string  $path  Cache files path
     */
    public function __construct($path = __DIR__){
        $path = realpath($path);
        if(file_exists($path) && is_dir($path)){
            $this->path = $path;
        }
    }

    /**
     * Stores data to memory.
     *
     * @param string  $entryName  Cache entry name
     * @param mixed   $data       Data to store
     */
    public function store($entryName, $data){
        $this->aData[$entryName] = $data;
    }

    /**
     * Saves data to file.
     *
     * @param string  $entryName  Cache entry name
     * @param mixed   $data       Data to store
     */
    public function save($entryName, $data){
        $this->store($entryName, $data);
        $filename = $this->path . '/' . $entryName . ".tmp";
        $json = json_encode($data, JSON_PRETTY_PRINT);
        file_put_contents($filename, $json);
    }

    /**
     * Returns true if cached data entry exists.
     *
     * @param string  $entryName  Cache entry name
     * @return boolean
     */
    public function exists($entryName){
        return isset($this->aData[$entryName]);
    }

    /**
     * Returns cached data by entry name.
     *
     * @param string   $entryName
     * @param mixed    $default
     * @param boolean  $loadIfNeeded
     * @return mixed
     */
    public function get($entryName, $default = NULL, $loadIfNeeded = FALSE, $cacheLifetime = FALSE){
        $result = $default;
        if($this->exists($entryName)){
            $result = $this->aData[$entryName];
        }elseif($loadIfNeeded){
            $filename = $this->path . '/' . $entryName . ".tmp";
            if(file_exists($filename)){
                if(FALSE !== $cacheLifetime){
                    $fileTime = filemtime($filename);
                    if((time() - $fileTime) > $cacheLifetime){
                        @unlink($filename);
                        return $result;
                    }
                }
                $contents = @file_get_contents($filename);
                $result = json_decode($contents, TRUE);
            }
        }
        return $result;
    }
}