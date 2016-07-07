# Ethplorer
Ethereum tokens (based on EIP20 standard) and transactions viewer

Mainnet and testnet are supported.

[Online version at Ethplorer.io](https://ethplorer.io)

# Instalation

Clone repository into separate webserver's directory.
```
cd /var/www
mkdir ethplorer
git clone https://github.com/amilabs/ethplorer.git cp-tools
```

Make sure your web server supports .htaccess and mod_rewrite.

# Configure RPC

Copy cfg/config.tools.sample.php to cfg/config.tools.php and specify RPC addresses.

Use composer to install dependencies.
```
php composer.phar install
```

