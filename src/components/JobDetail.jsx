import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Big from 'big.js';
import JobDetailAdminCommands from './JobDetailAdminCommands';
import JobDetailUserCommands from './JobDetailUserCommands';
import ApplicationForm from './ApplicationForm';
import { Button } from 'react-materialize';

const JobDetail = ({daoData, currentUser, onCancelJob, onStartJob, onApplyForJob, roketoContract, onEnablePayment, onReceivePayment, wrapContract, onUnwrap}) => {
  const { dao, job } = useParams();
  const [ jobData, setJobData ] = useState();
  const [ jobPayment, setJobPayment ] = useState();
  const [ stream, setStream ] = useState();
  const [ state, setState ] = useState();
  const [ hasWrapped, setHasWrapped ] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const result = await wrapContract.ft_balance_of(
      {
        account_id: currentUser.accountId
      });
      console.log(result);
      if(result){
        setHasWrapped(parseInt(result) > 0);
      }
    }

    fetchData();
  }, [currentUser, wrapContract]);

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }

    let data = daoData.jobs.find((j) => j.id === job);
    let duration = parseInt(data.payment_cycle_in_s);
    let seconds = duration%60;
    let minutes = Math.floor((duration%(60*60))/60);
    let hours = Math.floor((duration%(60*60*24))/(60*60));
    let days = Math.floor(duration/(60*60*24));
    duration = '';
    if(days){
      duration += ' ' + days + 'd';
    }
    if(hours){
      duration += ' ' + hours + 'h';
    }
    if(minutes){
      duration += ' ' + minutes + 'm';
    }
    if(seconds){
      duration += ' ' + seconds + 's';
    }
    data.duration = duration;
    setJobData(data);
    setJobPayment(Big(data.payment).div(10 ** 24).toFixed(2))
  }, [daoData, job]);

  useEffect(() => {
    async function fetchData() {
      if(!jobData || !jobData.payment_stream_id){
        return;
      }
      const result = await roketoContract.get_stream(
      {
        stream_id: jobData.payment_stream_id
      });
      console.log(result);
      setStream(result);
    }

    fetchData();
  }, [jobData]);

  useEffect(() => {
    if(jobData && stream){
      switch(jobData.state){
        case 'InProgress':
          if(stream.status === 'Active'){
            setState('Running')
          }
          else{
            setState('Completed/Cancelled')
          }
          break;
        default:
          setState(jobData.state)
          break;
      }
    }
  }, [jobData, stream]);

  if(!jobData){
    return <>
              <header>
                <h1>{job}'s Details</h1>
              </header>
              <h1>Loading...</h1>
          </>
  }
  
   return <>
                 <header>
                   <h1>{jobData.name}'s Details</h1>
                 </header>
                 <div className='flex flex-row-wrap margin-row-small'>
                   {hasWrapped
                   ? <Button large 
                             tooltip='You have wrapped NEAR. This function will unwrap all wrapped near.' 
                             onClick={onUnwrap}
                             className='medium-margin-right'>
                         Unwrap NEAR
                     </Button>
                   : null}
                   {currentUser.accountId === dao 
                   ? <JobDetailAdminCommands jobData={jobData} onCancelJob={onCancelJob} onStartJob={onStartJob} stream={stream}/> 
                   : jobData && jobData.contracted === currentUser.accountId
                      ? <JobDetailUserCommands currentUser={currentUser} roketoContract={roketoContract} onEnablePayment={onEnablePayment}
                                               stream={stream} onReceivePayment={onReceivePayment} jobId={jobData.id}/>
                      : null}
                 </div>
                 <div className='flex flex-row-wrap justify-between'>
                    <div className="details-view flex flex-col flex-grow medium-margin-right">
                      <div className='margin-row-small text-bigger preserve-newline'>
                        {jobData.description}
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Status:</div>
                        <div>{state}</div>
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Total Payment:</div>
                        <div>{jobPayment} Ⓝ</div>
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Contract Duration:</div>
                        <div>{jobData.duration}</div>
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Applications:</div>
                        <div>{jobData.applicants.length}</div>
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Contracted:</div>
                        <div>{jobData.contracted}</div>
                      </div>
                    </div>
                    {stream && stream.status == 'Active'
                      ? <div className='details-view flex flex-col'>
                          Some progress for the stream
                        </div>
                      : null}
                 </div>
                 {(dao !== currentUser.accountId && jobData.state === 'Open') ? <div className="margin-row-big"><ApplicationForm onApplyForJob={onApplyForJob} jobId={jobData.id}/></div> : null}
          </>
}

export default JobDetail;