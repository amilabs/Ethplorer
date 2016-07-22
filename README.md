# Ethplorer

Ethereum tokens and transactions viewer.

View tokens developed with ethereum [ERC20 (before known as EIP20)](https://github.com/ethereum/EIPs/issues/20) standard.
Explore sender, receiver and amount of transaction in token units.


[Online version at Ethplorer.io](https://ethplorer.io)

# Installation

Clone repository into separate webserver's directory.
```
cd /var/www
mkdir ethplorer
git clone https://github.com/everexio/ethplorer.git ethplorer
```

Make sure your web server supports .htaccess and mod_rewrite.

# Configure

Copy cfg/config.ethplorer.sample.js to cfg/config.ethplorer.js and specify service addresses.
