require('babel-register');
require('babel-polyfill');
require('dotenv').config();


module.exports = {
  networks: {
    development:{
      host:"127.0.0.1",
      port:7545,
      network_id:"*" //match any network id
    },
    kovan:{
      provider:function(){
        return new HDWalletProvider(
          // private key
          // url to an ethereum node
        )
      },
    }
  },
  contracts_directory:'./src/contracts/',
  contracts_build_directory:'./src/abis/', 
  compilers: {
    solc: {
       optimizer: {
         enabled: true,
         runs: 200
       },
       // evmVersion: "byzantium"
      }
    }
  }
