import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import Layout from './layout';
import DaoLayout from './dao-layout';
import CreateDao from './components/CreateDao';
import DaoDashboard from './components/DaoDashboard';
import JobsOverview from './components/JobsOverview';
import JobDetail from './components/JobDetail';
import MembersOverview from './components/MembersOverview';
import TasksOverview from './components/TasksOverview';
import ApplicationOverview from './components/ApplicationOverview';
import Voting from './components/Voting';
import NotFound from './components/404.jsx';
import 'materialize-css/dist/css/materialize.css'
import './App.css';
import Big from 'big.js';
import { Route, Routes } from 'react-router-dom'
var version = require('../package.json').version;
require('materialize-css');

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet, provider, lastTransaction, error, roketoContract, wrapContract }) => {
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
        //dao creation
        let message = result.receipts_outcome[0].outcome.logs.pop();
        if(!message){
          //start job
          message = result.receipts_outcome[3].outcome.logs.pop();
        }
        if(!message){
          //receive payment
          message = result.receipts_outcome[result.receipts_outcome.length-3].outcome.logs.pop();
        }
        if(!message && result.transaction.actions[0].FunctionCall.method_name === 'stop_stream'){
          //TODO start update status contract call
          message = "Executed payment stream cancellation method."
        }
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

  const onCancelJob = (streamId) => {
      roketoContract.stop_stream(
        {
          stream_id: streamId
        },
        BOATLOAD_OF_GAS,
        1
      ).then((_) => {
        console.log("Successfully canceled.");
      })
  }

  const onStartJob = (jobId, contracted) => {
      contract.start_job(
        {
          job_id: jobId,
          contracted: contracted
        },
        BOATLOAD_OF_GAS,
        Big('1').times(10 ** 22).toFixed()
      ).then((_) => {
        console.log("Successfully started.");
      })
  }

  const onDaoCreation = (e) => {
    e.preventDefault();

    const { fieldset, name_prompt, description_prompt, icon_prompt } = e.target.elements;
    
    fieldset.disabled = true;

    contract.create_dao(
      {
        dao_owner_id: currentUser.accountId,
        name: name_prompt.value,
        description: description_prompt.value,
        icon: icon_prompt.value ?? ''
      },
      BOATLOAD_OF_GAS,
      Big('1').times(10 ** 25).toFixed()
    )
  }

  const onJobCreation = (e) => {
    e.preventDefault();

    const { fieldset, name_prompt, description_prompt, payment_prompt, duration_prompt } = e.target.elements;
    const payment = Big(payment_prompt.value).times(10 ** 24).toFixed();
    
    fieldset.disabled = true;

    contract.create_job_offering(
      {
        name: name_prompt.value,
        description: description_prompt.value,
        payment: payment,
        payment_cycle_in_s: duration_prompt.value
      },
      BOATLOAD_OF_GAS,
      payment
    ).then((_) => {
      console.log("Successfully created job.");
    })
  }

  const onApplyForJob = (e) => {
    e.preventDefault();

    const { fieldset, job_id, application_prompt } = e.target.elements;
    
    fieldset.disabled = true;
    
    contract.apply_for_job(
      {
        dao_owner: dao,
        job_id: job_id.value,
        application: application_prompt.value
      },
      BOATLOAD_OF_GAS,
      0
    ).then((_) => {
      fieldset.disabled = false;
      application_prompt.value = '';
      application_prompt.focus();
      setMessage('Successfully applied for the job.');
    })
  }

  const onEnablePayment = () => {
    roketoContract.account_update_cron_flag(
      {
        is_cron_allowed: true
      },
      BOATLOAD_OF_GAS,
      1
    ).then((_) => {
      console.log("Successfully enabled payment.");
    })
  }

  const onReceivePayment = (jobId) => {
      contract.receive_job_payment(
        {
          dao_owner: dao,
          job_id: jobId
        },
        BOATLOAD_OF_GAS,
        Big('1').times(10 ** 21).toFixed()
      ).then((_) => {
        console.log("Successfully received payment.");
      })
  }

  const onUnwrap = async () => {
    const balance = await wrapContract.ft_balance_of(
      {
        account_id: currentUser.accountId
      }
    );
    await wrapContract.near_withdraw(
      {
        amount: balance
      },
      BOATLOAD_OF_GAS,
      1
    );
    console.log("Successfully unwrapped.");
  }
  
  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, methodNames: [contract.cancel_job.name, 
                                                          contract.start_job.name, 
                                                          contract.create_job_offering.name,
                                                          contract.apply_for_job.name]}, //contract requesting access
      'NEAR Challenge #8 - DAO Dashboard', //optional name
      null, //optional URL to redirect to if the sign in was successful
      null //optional URL to redirect to if the sign in was NOT successful
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.reload(false);
  };

  const clearMessage = () => {
    setMessage('');
  };

  if(!currentUser){
    return <SignIn signIn={signIn}/>;
  }
  // Voting https://snapshot.org/#/sushigov.eth
  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}/>}>
        <Route index element={<CreateDao version={version} currentUser={currentUser} contract={contract} onDaoCreation={onDaoCreation}/>}/>
        <Route path=":dao" element={<DaoLayout setDao={setDao}/>}>
          <Route index element={<DaoDashboard daoData={daoData} loaded={loaded}/>}/>
          <Route path="jobs">
            <Route index element={<JobsOverview daoData={daoData} loaded={loaded} onJobCreation={onJobCreation} currentUser={currentUser}/>}/>
            <Route path=":job" element={<JobDetail daoData={daoData} currentUser={currentUser} 
                                                   onCancelJob={onCancelJob} onStartJob={onStartJob} 
                                                   onApplyForJob={onApplyForJob} roketoContract={roketoContract}
                                                   onEnablePayment={onEnablePayment} onReceivePayment={onReceivePayment}
                                                   wrapContract={wrapContract} onUnwrap={onUnwrap}/>}/>
            {currentUser.accountId === dao
              ? <Route path=":job/applications" element={<ApplicationOverview daoData={daoData}/>}/>
              : null
            }
          </Route>
          <Route path="tasks">
            <Route index element={<TasksOverview daoData={daoData} loaded={loaded}/>}/>
          </Route>
          <Route path="members">
            <Route index element={<MembersOverview daoData={daoData}/>}/>
          </Route>
          <Route path="governance">
            <Route index element={<Voting daoData={daoData} loaded={loaded}/>}/>
          </Route>
          <Route path="*" element={<NotFound/>}/>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
