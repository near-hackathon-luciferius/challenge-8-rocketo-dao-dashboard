import React, {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';

const JobsOverview = ({daoData, loaded}) => {
  const { dao } = useParams();
  const [ jobs, setJobs ] = useState([]);

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }
    setJobs(splitArrayIntoChunksOfLen(daoData.jobs, 3));
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
                 {daoData.jobs.length > 0
                 ? jobs.map(chunk =>
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
                      Currently there are no jobs available. Come back later.
                  </p>}
          </>
}

export default JobsOverview;