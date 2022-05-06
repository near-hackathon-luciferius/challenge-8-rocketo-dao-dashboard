import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

const MembersOverview = ({daoData}) => {
  const { dao } = useParams();
  const [ members, setMembers ] = useState();

  Array.prototype.selectMany = function (fn) {
    return this.map(fn).reduce(function (x, y) { return x.concat(y); }, []);
  };

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }

    let data = daoData.jobs.map((j) => j.contracted)
                      .concat(daoData.jobs.selectMany((j) => j.applicants)
                                     .map((a) => a.applicant))
                      .filter((value, index, array) => array.indexOf(value) === index && value);
    setMembers(splitArrayIntoChunksOfLen(data,3));
  }, [daoData]);
  
  const splitArrayIntoChunksOfLen = (arr, len) => {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }

  if(!members){
    return <>
              <header>
                <h1>{dao}'s Members</h1>
              </header>
              <h1>Loading...</h1>
          </>
  }
  
   return <>
                 <header>
                   <h1>{daoData.name}'s Members</h1>
                 </header>
                 <div className="row">
                   <div className='col s4'>
                    <div className="card">
                        <div className="card-title flex flex-row">
                          <div className='min-margin-right'>{dao}</div>
                        </div>
                        <div className="card-content">
                          <div className='flex justify-between margin-row-small'>
                            <div className='text-unimportant min-margin-right'>Role:</div>
                            <div>Admin</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                 {members.length > 0
                 ? members.map(chunk =>
                  <div className="row">
                    {chunk.map(member => 
                      <div className="col s4">
                        <div className="card">
                            <div className="card-title flex flex-row">
                              <div className='min-margin-right'>{member}</div>
                            </div>
                            <div className="card-content">
                              <div className='flex justify-between margin-row-small'>
                                <div className='text-unimportant min-margin-right'>Role:</div>
                                <div>User</div>
                              </div>
                            </div>
                          </div>
                      </div>)}
                  </div>)
                 : <p>
                      Currently there are no members in this DAO active.
                  </p>}
          </>
}

export default MembersOverview;