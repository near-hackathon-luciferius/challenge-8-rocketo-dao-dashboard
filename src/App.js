import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SignIn from './components/SignIn';
import Big from 'big.js';
import Layout from './layout';
import NotFound from './components/404.jsx';
import Dashboard from './components/Dashboard.jsx';
import Collection from './components/Collection.jsx';
import Payout from './components/Payout.jsx';
import 'materialize-css/dist/css/materialize.css'
import './App.css';
import { Route, Routes } from 'react-router-dom'
var version = require('../package.json').version;
require('materialize-css');

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();

const App = ({ contract, nftContract, currentUser, nearConfig, wallet, provider, lastTransaction, error }) => {
  const [message, setMessage] = useState('');

  const onNftMint = (e) => {
    e.preventDefault();

    const { fieldset } = e.target.elements;
    const amount = e.target.elements.item(1);

    fieldset.disabled = true;

    contract.buy_animal(
      {
        count: parseInt(amount.value)
      },
      BOATLOAD_OF_GAS,
      Big('1').times(10 ** 24).times(amount.value).toFixed()
    ).then((_) => {
      console.log("Successfully minted.");
    })
  }

  const onPayout = (set) => {
    contract.payout(
      {
        nft_set: set.map(id => parseInt(id))
      },
      BOATLOAD_OF_GAS,
      0
    ).then((_) => {
      console.log("Successfully payed out.");
    })
  }
  
  useEffect(() => {
      if (error){
        setMessage(decodeURI(error));
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }
      else if (lastTransaction && currentUser) {          
        getState(lastTransaction, currentUser.accountId);
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }

      async function getState(txHash, accountId) {
        const result = await provider.txStatus(txHash, accountId);
        //minting
        let message = result.receipts_outcome[0].outcome.logs.pop();
        if(!message){
          //payout
          message = result.receipts_outcome[6].outcome.logs.pop();
        }
        setMessage(message);
      }
  }, [lastTransaction, error, currentUser, provider]);
  
  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, methodNames: [contract.buy_animal.name, contract.payout.name]}, //contract requesting access
      'NEAR Challenge #8 - DAO Dashboard', //optional name
      null, //optional URL to redirect to if the sign in was successful
      null //optional URL to redirect to if the sign in was NOT successful
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}/>}>
        <Route index element={
          currentUser
            ? <Dashboard version={version} nearConfig={nearConfig}/>
            : <SignIn signIn={signIn}/>
        }/>
        <Route path="collection" element={
          currentUser
            ? <Collection onNftMint={onNftMint} currentUser={currentUser} contract={nftContract}/>
            : <SignIn signIn={signIn}/>
        }/>
        <Route path="payout" element={
          currentUser
            ? <Payout onPayout={onPayout} currentUser={currentUser} contract={nftContract}/>
            : <SignIn signIn={signIn}/>
        }/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  );
}

App.propTypes = {
  contract: PropTypes.shape({
    buy_animal: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
