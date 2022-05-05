import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import Layout from './layout';
import DaoLayout from './dao-layout';
import CreateDao from './components/CreateDao';
import DaoDashboard from './components/DaoDashboard';
import JobsOverview from './components/JobsOverview';
import JobDetail from './components/JobDetail';
import MembersOverview from './components/MembersOverview';
import MemberDetail from './components/MemberDetail';
import TasksOverview from './components/TasksOverview';
import TaskDetail from './components/TaskDetail';
import NotFound from './components/404.jsx';
import 'materialize-css/dist/css/materialize.css'
import './App.css';
import { Route, Routes } from 'react-router-dom'
var version = require('../package.json').version;
require('materialize-css');

//const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet, provider, lastTransaction, error }) => {
  const [message, setMessage] = useState('');
  const [dao, setDao] = useState('');
  const [daoData, setDaoData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
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
        if(message){
          setMessage(message);
        }
      }
  }, [lastTransaction, error, currentUser, provider]);
  
  useEffect(() => {
      async function fetchData() {
        if(!dao){
          return;
        }
        const result = await contract.get_dao(
        {
          dao_owner: dao
        });
        console.log(result);
        setDaoData(result);
        setLoaded(true);
      }
      
      fetchData();
  }, [contract, currentUser, dao]);
  
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

  if(!currentUser){
    return <SignIn signIn={signIn}/>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}/>}>
        <Route index element={<CreateDao version={version}/>}/>
        <Route path=":dao" element={<DaoLayout setDao={setDao}/>}>
          <Route index element={<DaoDashboard version={version}/>}/>
          <Route path="jobs">
            <Route index element={<JobsOverview daoData={daoData} loaded={loaded}/>}/>
            <Route path=":job" element={<JobDetail daoData={daoData}/>}/>
          </Route>
          <Route path="tasks">
            <Route index element={<TasksOverview/>}/>
            <Route path=":task" element={<TaskDetail/>}/>
          </Route>
          <Route path="members">
            <Route index element={<MembersOverview version={version} nearConfig={nearConfig}/>}/>
            <Route path=":member" element={<MemberDetail/>}/>
          </Route>
          <Route path="*" element={<NotFound/>}/>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
