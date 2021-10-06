import React,{Component} from 'react';
import {connect} from 'react-redux';
import Mobileint from './mobileint';
import {accountSelector} from '../store/selectors'
import {isMobile} from 'react-device-detect';
import { loadAllOrders,subscribeToEvents }from "../store/interactions"
import {exchangeSelector} from '../store/selectors' 
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './myTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';  
import NewOrder from './NewOrder';  

class Content extends Component{

  componentWillMount() {
    this.loadBlockchainData(this.props)

  }

  async loadBlockchainData(props) {

    const {dispatch,exchange}=props
    await loadAllOrders(exchange,dispatch)
    await subscribeToEvents(exchange,dispatch)
    
  }
  render(){
        return(
          <div>
        {/* { !isMobile ? <content/> : <Mobileint/>}  */}
          
          <div className="content">
              <div className="vertical-split">
                <Balance/>
                <NewOrder/>
              </div>
              <OrderBook/>
              <div className="vertical-split">
                <PriceChart/>
                <MyTransactions/>
              </div>
              <Trades/>


            </div>
            </div>
              )
        } 
    }
  


function mapStateToProps(state){
    return{
      exchange:exchangeSelector(state)
    }
}

export default connect(mapStateToProps )(Content)