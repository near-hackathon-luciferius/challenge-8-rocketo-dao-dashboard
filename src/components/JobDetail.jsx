import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Iframe from 'react-iframe';

const JobDetail = ({daoData}) => {
  const { job } = useParams();
  const [ jobData, setJobData ] = useState();

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }
    setJobData(daoData.jobs.find((j) => j.id === job));
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
                 <p>
                    {jobData.description}
                 </p>
                 <p>
                    Status: {jobData.state}
                 </p>
                 {jobData.payment_stream_id 
                 ? <Iframe url={"https://test.app.roke.to/#/streams/"+jobData.payment_stream_id}
                           position="relative"
                           overflow="hidden"
                           className='roketo-iframe'/>
                 : null}
          </>
}

export default JobDetail;