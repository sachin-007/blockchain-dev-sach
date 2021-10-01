import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Token from '../abis/Token.json';
import Navbar from './Navbar'
import { connect } from 'react-redux';
import { loadWeb3,
  loadAccount,
  loadToken,
  loadExchange } from '../store/interactions';

import {accountSelector} from '../store/selectors'
import Content from './Content';
import {contractsLoadedSelector} from '../store/selectors'

import {isMobile} from 'react-device-detect';





class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
    if(!isMobile==true){
      window.ethereum.enable()
    }
  }

  async loadBlockchainData(dispatch) {


    

    // if(!isMobile) {await window.ethereum.enable();}

  

    const web3 = loadWeb3(dispatch)
    // await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3,dispatch)

    const exchange = await loadExchange(web3,networkId,dispatch)
    if(!exchange){
      window.alert("Exchange smart contract not detected on the current network.Please select another newtwork with metamask")
    }

    const accounts = await loadAccount(web3,dispatch)
    const token = await loadToken(web3,networkId,dispatch)
    if(!token){
      window.alert("Token smart contract not detected on the current network.Please select another newtwork with metamask")
      return
    }
    

    // const totalSupply = await token.methods.totalSupply().call()
    // console.log("totalSupply", totalSupply)
    // const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545')
    // console.log("web3",web3)
    // const network = await web3.eth.net.getNetworkType()
    // console.log("network",network);
    // const accounts = await web3.eth.getAccounts()
    // console.log("accounts",accounts);
    // web3.eth.getAccounts().then(console.log);

    // const networkId = await web3.eth.net.getId()
    // const token = web3.eth.Contract(Token.abi,Token.networks[networkId].address)
    // const totalSupply = await token.methods.totalSupply().call()
    // console.log("totalSupply", totalSupply)
  }
  



  render() {
    return (
      <div>
        <Navbar/>
        {this.props.contractsLoaded ? <Content/> : <div className="content"></div>  }
        {/* {this.props.contractsLoaded && !isMobile ? <Content/> : <Mobileint/>}  */}
        {/* <Mobileint/>  */}
        {/* {this.props.contractsLoaded && isMobile ? <Content/> : <Mobileint/>) } */}
        {/* <div className="content" ></div> */}        
      </div>
    );
  }
}

function mapStateToProps(state){
  return{
    contractsLoaded:contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);
