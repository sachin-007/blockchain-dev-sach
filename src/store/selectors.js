import { get, groupBy, maxBy, minBy } from 'lodash'
import moment from 'moment'
import {createSelector} from 'reselect' 
import { create, reject } from 'underscore'
import {ETHER_ADDRESS,tokens,ether,GREEN,RED} from '../helpers'


// TODO: Move me to helpers file
export const formatBalance = (balance) => {
    const precision = 100 // 2 decimal places
  
    balance = ether(balance)
    balance = Math.round(balance * precision) / precision // Use 2 decimal places
  
    return balance
  }


const account =state => get(state,'web3.account')
export const accountSelector = createSelector(account,account=>account)

const web3 = state =>get(state,'web3.connection')
export const web3Selector=createSelector(web3,w=>w)

const tokenLoaded = state => get(state,'token.loaded',false)
export const accountLoadedSelector = createSelector(tokenLoaded,tl=>tl)

const token = state => get(state,'token.contract')
export const tokenSelector = createSelector(token,t=>t)

const exchangeLoaded = state => get(state,'exchange.loaded',false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded,el=>el)

const exchange = state => get(state,'exchange.contract')
export const exchangeSelector = createSelector(exchange,e=>e)

export const contractsLoadedSelector=createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl,el) => (tl && el)
)
// all orders
const allOrdersLoaded = state => get(state,'exchange.allOrders.loaded',false)
const allOrders = state => get(state,'exchange.allOrders.data',[])

// cancelled orders
const cancelledOrdersLoaded = state =>get(state,'exchange.cancelledOrders.loaded',false)
export const cancelledOrdersDelector = createSelector(cancelledOrdersLoaded,loaded=>loaded)

const cancelledOrders = state => get(state,'exchange.cancelledOrders.data',[])
export const cancelledOrdersSelector = createSelector(cancelledOrders,o=>o)

// filled orders
const filledOrdersLoaded = state => get(state,'exchange.filledOrders.loaded',false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded,loaded=>loaded)

const filledOrders = state => get(state,'exchange.filledOrders.data',[])
export const filledOrdersSeletor = createSelector(
    filledOrders,
    (orders)=>{

        // sort orders by data ascending for displaying
        orders = orders.sort((a,b)=>a.timestamp - b.timestamp)        
        
        // decorate the orders
        orders = decorateFilledOrders(orders)

        // sort orders by data descending for displaying
        orders = orders.sort((a,b)=>b.timestamp - a.timestamp)
        return orders
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
            return order 
    })
    )
}

const decorateOrder=(order)=>{
    let etherAmount
    let tokenAmount

    if(order.tokenGive === ETHER_ADDRESS){
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

const openOrders = state=>{
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all,(order)=>{
        const orderFilled = filled.some((o)=>o.id === order.id)
        const orderCancelled = cancelled.some((o)=>o.id === order.id)
        return (orderFilled || orderCancelled)
        
    })
    return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded,loaded=>loaded)

// create the order book
export const orderBookSelector = createSelector(
    openOrders,
    (orders)=>{
        // Decore orders
        orders = decorateOrderBookOrders(orders)
        // group orders by "orderType"
        orders = groupBy(orders,"orderType") 
        // fetch buy orders
        const buyOrders = get(orders,"buy",[])
        //sort buy orders by token price
        orders={
            ...orders,  
            buyOrders:buyOrders.sort((a,b)=>b.tokenPrice - a.tokenPrice)
        }

        // fetch sell orders
        const sellOrders = get(orders,"sell",[])
        //sort sell orders by token price
        orders={
            ...orders,  
            sellOrders:sellOrders.sort((a,b)=>b.tokenPrice - a.tokenPrice)
        }

        return orders
    }
)

const decorateOrderBookOrders = (orders)=>{
    return(
        orders.map((order)=>{
            order = decorateOrder(order)
            order = decorateOrderBookOrder(order)
            // decorate order book order
            return(order)
        })
    )
}

const decorateOrderBookOrder = (order)=>{
    const orderType = order.tokenGive === ETHER_ADDRESS ?'buy':"sell"
    return({
        ...order,
        orderType,
        orderTypeClass:(orderType === "buy"?GREEN:RED),
        orderFillAction: orderType === "buy"?"sell":"buy"
    })
}

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded,loaded=>loaded)

export const myFilledOrdersSelector=createSelector(
    account,
    filledOrders,
    (account,orders)=>{
        //find our order
        orders = orders.filter((o)=>o.user===account || o.userFill === account)
        // sort by date ascending 
        orders = orders.sort((a,b)=>a.timestamp - b.timestamp)
        // decorate orders - add dispaly attributes
        orders = decorateMyFilledOrders(orders,account)
        return orders
    }
)

const decorateMyFilledOrders = (orders,account)=>{
    return(
        orders.map((order)=>{
            order = decorateOrder(order)
            order = decorateMyFilledOrder(order,account)
            return(order)
        })
    )
}

const decorateMyFilledOrder = (order,account)=>{
    const myOrder = order.user === account

    let orderType
    if(myOrder){
        orderType = order.tokenGive === ETHER_ADDRESS ? 'buy':'sell'
    }else{
        orderType = order.tokenGive === ETHER_ADDRESS ? "sell":"buy"
    }

    return({
        ...order,
        orderType,
        orderTypeClass:(orderType === "buy"?GREEN:RED),
        orderSign:(orderType === "buy"? '+':'-')
    })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded,loaded=>loaded)
export const myOpenOrdersSelector = createSelector(
    account,
    openOrders,
    (account,orders)=>{
        //filer orders create by current account
        orders = orders.filter((o)=>o.user ===account )
        // decorate orders - add dispay attributes
        orders = decorateMyOpenOrders(orders)
        // sort orders by date decending
        orders = orders.sort((a,b)=> b.timestamp - a.timestamp)
        return orders
    }
)

const decorateMyOpenOrders = (orders,account)=>{
    return(
        orders.map((order)=>{
            order = decorateOrder(order)
            order = decorateMyOpenOrder(order,account)
            return(order)
        })
    )
}

const decorateMyOpenOrder = (order,account)=>{
    let orderType = order.tokenGive === ETHER_ADDRESS?'buy':'sell'

    return({
        ...order,
        orderType,
        orderTypeClass:(orderType ==='buy' ? GREEN:RED)
    })
}

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded,loaded => loaded)

export const priceChartSelector = createSelector(
    filledOrders,
    (orders)=>{
        // sort orders by date ascending to compare history
        orders = orders.sort((a,b)=>a.timestamp - b.timestamp)
        // decorate Orders -add display attributes
        orders = orders.map((o)=>decorateOrder(o))
        // get last two orders for final price and price change
        let secoundLastOrder,lastOrder
        [secoundLastOrder,lastOrder]=orders.slice(orders.length-2,orders.length)
        // get last order price 
        const lastPrice = get(lastOrder,'tokenPrice',0)
        // get secound last order price 
        const secoundLastPrice = get(secoundLastOrder,'tokenPrice',0)

        return({
            lastPrice,
            lastPriceChange:(lastPrice >= secoundLastPrice ? '+':'-'),
            series:[{
                // data:buildGraphData(orders)
                data:buildGraphData(orders)
            }]
        })
    }
)

const buildGraphData = (orders)=>{
    // group the orders by hour for the graph
    orders = groupBy(orders,(o)=>moment.unix(o.timestamp).startOf('hour').format())
    // get each hour where data exists
    const hours = Object.keys(orders)
    // build the graph series
    const graphData = hours.map((hour)=>{
        // fetch all the orders from current hour
        const group=orders[hour]

        // calculate price values -open,high,low,close
        const open=group[0] //first order
        const high=maxBy(group,'tokenPrice') //high price
        const low=minBy(group,'tokenPrice') //low price
        const close = group[group.length-1] //last order

        
        return({
            x:new Date(hour),
            y:[open.tokenPrice,high.tokenPrice,low.tokenPrice,close.tokenPrice]
        })
    })
    return graphData
}


const orderCancelling = state => get(state,'exchange.orderCancelling',false)
export const orderCancellingSelector = createSelector(orderCancelling,state=>state)

const orderFilling = state => get(state,'exchange.orderFilling',false)
export const orderFillingSelector = createSelector(orderFilling,status=>status)


const balancesLoading = state => get(state,"exchange.balancesLoading",false)
export const balancesLoadingSelector = createSelector(balancesLoading,status=>status)

const etherBalance = state =>get(state,'web3.balance',0)
export const etherBalanceSelector = createSelector(
    etherBalance,
    (balance)=>{
        return formatBalance(balance)
    }
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
  tokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeEtherBalance = state => get(state,'exchange.etherBalance',0)
export const exchangeEtherBalanceSelector = createSelector(
    exchangeEtherBalance,
    (balance)=>{
        return formatBalance(balance)
    }
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
  exchangeTokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const etherDepositAmount = state => get(state,'exchange.etherDepositAmount',null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount,amount=>amount)

const etherWithdrawAmount = state => get(state,'exchange.etherWithdrawAmount',null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount,amount=>amount)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)

const buyOrder = state => get(state,'exchange.buyOrder',{})
export const buyOrderSelector = createSelector(buyOrder,order=>order)

const sellOrder = state => get(state,'exchange.sellOrder',{})
export const sellOrderSelector = createSelector(sellOrder,order=>order)