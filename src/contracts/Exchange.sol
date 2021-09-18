// deposite and withdraw funds
// manage orders - make or cancel
// handle  trades - charge fee

// TODO
// [ ] set the fees
// [ ] deposite ether
// [ ] withdraw ether 
// [ ] deposite tokens
// [ ] withdraw tokens
// [ ] check balances
// [ ] make order
// [ ] cancel order 
// [ ] fill order
// [ ] charge fees


pragma solidity ^0.5.0;

contract Exchange{
	address public feeAccount;

	constructor(address _feeAccount) public{
		feeAccount = _feeAccount;
	}
}