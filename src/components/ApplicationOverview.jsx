import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Button } from 'react-materialize';

const ApplicationOverview = ({daoData}) => {
  const { job } = useParams();
  const [ applications, setApplications ] = useState();
  const [ jobName, setJobName ] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }

    let data = daoData.jobs.find((j) => j.id === job);
    setApplications(splitArrayIntoChunksOfLen(data.applicants,2));
    setJobName(data.name);
  }, [daoData, job]);
  
  const splitArrayIntoChunksOfLen = (arr, len) => {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }

  const goBack = () => {
      navigate(-1);
  }

  const copyApplicant = async (applicant) => {
    await navigator.clipboard.writeText(applicant);
  }

  if(!applications){
    return <>
              <header>
                <h1>{job}'s Applications</h1>
              </header>
              <h1>Loading...</h1>
          </>
  }
  
   return <>
                 <header>
                   <h1>{jobName}'s Applications</h1>
                 </header>
                 <div className='flex flex-row-wrap justify-between margin-row-small'>
                    <Button large 
                            onClick={goBack}>
                        <div className='flex flex-row'>
                          <div className='min-margin-right'><ArrowBackOutlinedIcon className='btn-icon'/></div>
                          <div>Back</div>
                        </div>
                    </Button>
                 </div>
                 {applications.length > 0
                 ? applications.map(chunk =>
                  <div className="row">
                    {chunk.map(application => 
                      <div className="col s6">
                        <div className="card">
                            <div className="card-title flex flex-row">
                              <div className='min-margin-right'>{application.applicant}</div>
                              <div className='bm-item menu-item'
                                   onClick={() => copyApplicant(application.applicant)}>
                                     <ContentCopyOutlinedIcon className='btn-icon'/>
                              </div>
                            </div>
                            <div className="card-content">
                              <p className='preserve-newline'>{application.application}</p>
                            </div>
                          </div>
                      </div>)}
                  </div>)
                 : <p>
                      Currently there are no applications for the job. Come back later.
                  </p>}
          </>
}

export default ApplicationOverview;