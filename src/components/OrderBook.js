import React,{Component} from 'react'
import { OverlayTrigger,Tooltip } from 'react-bootstrap'
import {connect} from 'react-redux'
import { orderBookSelector,
    orderBookLoadedSelector,
    exchangeSelector,
    accountSelector,
    orderFillingSelector    
} from '../store/selectors'
import Spinner from './Spinner'
import {fillOrder} from '../store/interactions'

const renderOrder=(order,props)=>{
    const {dispatch,exchange,account}=props
    return(
        <OverlayTrigger key={order.id}
        placement="auto"
        overlay={
            <Tooltip id={order.id}>
                {`Click here to ${order.orderFillAction}`}
            </Tooltip>
        }>
        
        <tr key={order.id}
        className="order-book-order"
        onClick={(e)=>fillOrder(dispatch,exchange,order,account)}
        >
            <td>{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td>{order.etherAmount}</td>
        </tr>
        </OverlayTrigger>
    )
}

const showOrderBook = (props)=>{
    const {orderBook} = props 
    return(
        <tbody>
            {/* List sell Orders */}
            {orderBook.sellOrders.map((order) => renderOrder(order,props))}
            {/* Show assets */}
            <tr>
                <th>DAPP</th>
                <th>DAPP/ETH</th>
                <th>ETH</th>
            </tr>
            {/* List buy Orders */}
            {orderBook.buyOrders.map((order) => renderOrder(order,props))}
        </tbody>
    )
}

class OrderBook extends Component{
    render(){
        console.log(this.props.showOrderBook,this.props.orderBook);
        return(
            <div className="vertical">
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Order Book
                  </div>
                  <div className="card-body order-book">
                      <table className="table table-dark table-sm small">
                          {this.props.showOrderBook? showOrderBook(this.props):<Spinner type="table"/>}
                      </table>
                  </div>
                </div>
              </div>
        )
    }
}

function mapStateToProps(state){
    const orderBookLoaded=orderBookLoadedSelector(state)
    const orderFilling = orderFillingSelector(state)    

    return{
        orderBook:  orderBookSelector(state),
        showOrderBook: orderBookLoaded && !orderFilling,
        account:accountSelector(state),
        exchange:exchangeSelector(state)
    }
}

export default connect(mapStateToProps)(OrderBook)