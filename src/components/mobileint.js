import React,{Component} from 'react';
import {connect} from 'react-redux';
// import Alert from 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.css';

import {accountSelector} from '../store/selectors'
import { Alert,Modal,Button } from 'react-bootstrap';
import {isMobile} from 'react-device-detect';

class Mobileint extends Component{
    render(){
        

        // window.onload = async function(){
        //     document.getElementById('close').onclick = function(){
        //         this.parentNode.parentNode.parentNode
        //         .removeChild(this.parentNode.parentNode);
        //         return false;
        //     };
        // };

        return(
            <div className="mobileint" id="alert-box">

               <Alert  variant="dark">
                <h1>please connect with desktop to access the application</h1>
              </Alert>


            <Modal.Dialog>
              <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p>Please connect with desktop to access the application</p>
                <h3>or</h3>
                 <p>check wether you connected with Metamask cause your contract Or Exchange maybe not Loaded.</p>
              </Modal.Body>

              <Modal.Footer>

              <span id='close' 
              onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return  false;'
              >Close</span>
                {/* <Button variant="primary"></Button> */}
              </Modal.Footer>
            </Modal.Dialog>


            </div>
        )
    }
}

function mapStateToProps(state){
    return{
    }
}

export default connect(mapStateToProps )(Mobileint)