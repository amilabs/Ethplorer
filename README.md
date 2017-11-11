# Ethplorer

Ethereum tokens viewer.

Easy to view tokens and custom data. Users first.

Support tokens developed with Ethereum's [ERC20 (before known as EIP20)](https://github.com/ethereum/EIPs/issues/20) standard.

Provides API, Widgets for websites.

[Online version at Ethplorer.io](https://ethplorer.io)

![alt tag](https://github.com/EverexIO/Ethplorer/blob/develop/images/ethplorer-home2.png)


# Widgets for third-party websites
![alt tag](https://github.com/EverexIO/Ethplorer/blob/develop/images/augur-widget.png)

[Samples and instructions for widget usage](https://ethplorer.io/widgets)


# API

Documentation available at [WIKI pages](https://github.com/EverexIO/Ethplorer/wiki/ethplorer-api).


# Installation

Clone repository into separate webserver's directory.

```
cd /var/www
mkdir ethplorer
git clone https://github.com/everexio/ethplorer.git ethplorer
```

Make sure your web server supports .htaccess and mod_rewrite.


# Configure

Copy `service/config.sample.php` to `service/config.php` and specify service addresses.
