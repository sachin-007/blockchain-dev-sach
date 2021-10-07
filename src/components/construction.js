import React,{Component} from 'react';
import {connect} from 'react-redux';





class Construction extends Component{
    render(){
        return(
            <div class="alert alert-warning">

                <div className="card-header alert-danger ">
                    DAPP On Construction    
                </div>
                <div class="alert  alert-info">
                    <strong>Everything is ready to deploy this project but there is a problem, 
                        but this is not actually a problem to deploy smart contract of Token and Exchange
                         there is a need of 3 kovan ETH on this 0x9cFEa707E1dD836234A5E515c1e44620455a2aFd address
                         to deploy smart contract on public blockchain on infura so i have to wait till i get 3-KETH 
                         or I can reduce the fees so i can deploy it with low KETH       
                     </strong>
                </div>
            </div>
        )
    }
}


function mapStateToProps(state){
    return{
        //
    }
}

export default connect(mapStateToProps)(Construction)