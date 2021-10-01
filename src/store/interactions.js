import Web3 from "web3"
import { 
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded
} from "./actions"

import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

export const loadWeb3 = (dispatch) =>{
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545')
    dispatch(web3Loaded(web3))
    return web3
}

export const loadAccount = async (web3,dispatch) =>{
    const accounts = await web3.eth.getAccounts()
    const account=accounts[0]
    dispatch(web3AccountLoaded(account))
    return account
}

export const loadToken = async(web3,networkId,dispatch)=>{
    try{
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    }catch(error){
        console.log('Contract not deployed to the current network.Please select another network with Metamask')
        return null;
    }

}

export const loadExchange = async(web3,networkId,dispatch)=>{
    try{
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    }catch(error){
        console.log('Contract not deployed to the current network.Please select another network with Metamask')
        return null;
    }

}


export const loadAllOrders = async(exchange,dispatch)=>{
    
    //fetch cancelled order with the "Cancel" event stream
    const cancelStream = await exchange.getPastEvents('Cancel',{fromBlock:0,toBlock:'latest'})
    // formate cancelled orders
    const cancelledOrders =  cancelStream.map((event)=>event.returnValues)
    // console.log(cancelStream);
    // console.log(cancelledOrders);

    //Add cancelled order to the redux store
    dispatch(cancelledOrdersLoaded(cancelledOrders)) 

    //fetch filled order with the "Trade" event stream
    const tradeStream = await exchange.getPastEvents('Trade',{fromBlock:0,toBlock:'latest'})
    // formate the filled orders
    const filledOrders = tradeStream.map((event)=>event.returnValues)

    //Add filled order to the redux store
    dispatch(filledOrdersLoaded(filledOrders)) 


    //fetch all order with the "Order" event stream

    // load order streams
    const orderStream = await exchange.getPastEvents('Order',{fromBlock:0,toBlock:'latest'})
    // format order stream
    const allOrders=orderStream.map((event)=>event.returnValues)
    // add open orders to the redux store
    dispatch(allOrdersLoaded(allOrders))
}