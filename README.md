# Ethplorer
Ethereum tokens (based on EIP20 standard) and transactions viewer

Mainnet and testnet are supported.

[Online version at Ethplorer.io](https://ethplorer.io)

# Installation

Clone repository into separate webserver's directory.
```
cd /var/www
mkdir ethplorer
git clone https://github.com/amilabs/ethplorer.git ethplorer
```

Make sure your web server supports .htaccess and mod_rewrite.

# Configure RPC

Copy cfg/config.tools.sample.php to cfg/config.tools.php and specify RPC addresses.

Use composer to install dependencies.
```
php composer.phar install
```

