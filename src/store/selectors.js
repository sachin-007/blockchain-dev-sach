import { get } from 'lodash'
import moment from 'moment'
import {createSelector} from 'reselect' 
import {ETHER_ADDRESS,tokens,ether,GREEN,RED} from '../helpers'


const account =state => get(state,'web3.account')
export const accountSelector = createSelector(account,account=>account)

const tokenLoaded = state => get(state,'token.loaded',false)
export const accountLoadedSelector = createSelector(tokenLoaded,tl=>tl)

const exchangeLoaded = state => get(state,'exchange.loaded',false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded,el=>el)

const exchange = state => get(state,'exchange.contract')
export const exchangeSelector = createSelector(exchange,e=>e)

export const contractsLoadedSelector=createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl,el) => (tl && el)
)

const filledOrdersLoaded = state => get(state,'exchange.filledOrders.loaded',false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded,loaded=>loaded)

const filledOrders = state => get(state,'exchange.filledOrders.data',[])
export const filledOrdersSeletor = createSelector(
    filledOrders,
    (orders)=>{

        // sort orders by data ascending for displaying
        orders=orders.sort((a,b)=>a.timestamp - b.timestamp)        
        
        // decorate the orders
        orders = decorateFilledOrders(orders)

        // sort orders by data descending for displaying
        orders=orders.sort((a,b)=>b.timestamp - a.timestamp)
        console.log(orders);
    }
)

const decorateFilledOrders = (orders)=>{
    //track previous orderto compaire history
    let previousOrder = orders[0]
    return(
    orders.map((order)=>{
        order = decorateOrder(order)  
        order = decorateFilledOrder(order,previousOrder)
        previousOrder = order //update the previous order once it's decorated
        return  order 
    })
    )
}

const decorateOrder=(order)=>{
    let etherAmount
    let tokenAmount

    if(order.tokenGive == ETHER_ADDRESS){
        etherAmount = order.amountGive
        tokenAmount = order.amountGet
    }else{
        etherAmount = order.amountGet
        tokenAmount = order.amountGive
    }

    // calculate token price to 5decimal places
    const precision = 100000
    let tokenPrice = (etherAmount/tokenAmount)
    tokenPrice = Math.round(tokenPrice * precision)/precision

    return({
        ...order,
        etherAmount:ether(etherAmount),
        tokenAmount:tokens(tokenAmount),
        tokenPrice,
        formattedTimestamp:moment.unix(order.timestamp).format('h:mm:ss a M/D')
    })
}

const decorateFilledOrder = (order,previousOrder)=>{
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice,order.id,previousOrder)

    })
}

const tokenPriceClass = (tokenPrice,orderId,previousOrder)=>{

    // show green price when only one order exists
    if(previousOrder.id === orderId){
        return GREEN
    }

    // show green when if order price higher than previous order

    // show red when if order price lower than previous order   
    if(previousOrder.tokenPrice <= tokenPrice){
        return GREEN //sucess 
    }else{
        return RED //danger
    }
}

