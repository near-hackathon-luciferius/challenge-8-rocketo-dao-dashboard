import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Iframe from 'react-iframe';
import Big from 'big.js';
import JobDetailAdminCommands from './JobDetailAdminCommands';

const JobDetail = ({daoData, currentUser, onCancelJob, onStartJob}) => {
  const { dao, job } = useParams();
  const [ jobData, setJobData ] = useState();

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }

    let data = daoData.jobs.find((j) => j.id === job);
    data.payment = Big(data.payment).div(10 ** 24).toFixed(2);
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
  }, [daoData, job]);

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
                 <div className='flex flex-row-wrap justify-between margin-row-small'>
                   {currentUser.accountId === dao ? <JobDetailAdminCommands jobData={jobData} onCancelJob={onCancelJob} onStartJob={onStartJob}/> : null}
                 </div>
                 <div className='flex flex-row-wrap justify-between'>
                    <div className="details-view flex flex-col flex-grow medium-margin-right">
                      <div className='margin-row-small text-bigger'>
                        {jobData.description}
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Status:</div>
                        <div>{jobData.state}</div>
                      </div>
                      <div className='flex justify-between margin-row-small'>
                        <div className='text-unimportant min-margin-right'>Total Payment:</div>
                        <div>{jobData.payment} Ⓝ</div>
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
                    {jobData.payment_stream_id 
                      ? <div>
                          <Iframe url={"https://test.app.roke.to/#/streams/"+jobData.payment_stream_id}
                                  position="relative"
                                  overflow="hidden"
                                  className='roketo-iframe'/>
                        </div>
                      : null}
                 </div>
          </>
}

export default JobDetail;