import React, {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import JobForm from './JobForm';

const JobsOverview = ({daoData, loaded, currentUser, onJobCreation}) => {
  const { dao } = useParams();
  const [ openJobs, setOpenJobs ] = useState([]);
  const [ runningJobs, setRunningJobs ] = useState([]);
  const [ canceledJobs, setCanceledJobs ] = useState([]);

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }
    setOpenJobs(splitArrayIntoChunksOfLen(daoData.jobs.filter((j) => j.state === 'Open'), 3));
    setRunningJobs(splitArrayIntoChunksOfLen(daoData.jobs.filter((j) => j.state === 'InProgress'), 3));
    setCanceledJobs(splitArrayIntoChunksOfLen(daoData.jobs.filter((j) => j.state === 'Canceled'), 3));
  }, [daoData]);
  
  const splitArrayIntoChunksOfLen = (arr, len) => {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }

  if(!loaded){
    return <>
              <header>
                <h1>{dao}'s Jobs Board</h1>
              </header>
              <h1>Loading...</h1>
          </>
  }
  
   return <>
                 <header>
                   <h1>{daoData.name}'s Jobs Board</h1>
                 </header>
                  <h5>Open Jobs</h5>
                  {daoData.jobs.length > 0
                  ? openJobs.map(chunk =>
                    <div className="row">
                      {chunk.map(job => 
                        <div className="col s4">
                          <Link className="bm-item menu-item" to={job.id}>
                            <div className="card">
                              <div className="card-title">{job.name}</div>
                              <div className="card-content">
                                <p>{job.description}</p>
                              </div>
                            </div>
                          </Link>
                        </div>)}
                    </div>)
                  : <p>
                        Currently there are no open jobs available.
                    </p>}
                  <h5>Active Jobs</h5>
                  {daoData.jobs.length > 0
                  ? runningJobs.map(chunk =>
                    <div className="row">
                      {chunk.map(job => 
                        <div className="col s4">
                          <Link className="bm-item menu-item" to={job.id}>
                            <div className="card">
                              <div className="card-title">{job.name}</div>
                              <div className="card-content">
                                <p>{job.description}</p>
                              </div>
                            </div>
                          </Link>
                        </div>)}
                    </div>)
                  : <p>
                        Currently there are no active jobs.
                    </p>}
                  <h5>Canceled Jobs</h5>
                  {daoData.jobs.length > 0
                  ? canceledJobs.map(chunk =>
                    <div className="row">
                      {chunk.map(job => 
                        <div className="col s4">
                          <Link className="bm-item menu-item" to={job.id}>
                            <div className="card">
                              <div className="card-title">{job.name}</div>
                              <div className="card-content">
                                <p>{job.description}</p>
                              </div>
                            </div>
                          </Link>
                        </div>)}
                    </div>)
                  : <p>
                        Currently there are no canceled jobs.
                    </p>}
                  {(dao === currentUser.accountId) ? <JobForm onJobCreation={onJobCreation}/> : null}
          </>
}

export default JobsOverview;