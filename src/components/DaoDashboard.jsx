import React, {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

export default function DaoDashboard({daoData, loaded}) {
  const { dao } = useParams();
  const [members, setMembers] = useState('');
  const [tasks, setTasks] = useState('');
  const [jobs, setJobs] = useState('');
  const [voting, setVoting] = useState('');

  useEffect(() => {
    if(!daoData.jobs){
      return;
    }
    
    setJobs(daoData.jobs.length);
    setTasks(5);
    setVoting(1);
    setMembers(daoData.jobs.map((j) => j.contracted)
                      .concat(daoData.jobs.map((j) => j.applicants).reduce(function (x, y) { return x.concat(y); }, [])
                                    .map((a) => a.applicant))
                      .filter((value, index, array) => array.indexOf(value) === index && value).length +1);
  }, [daoData]);

  if(!loaded){
    return <>
              <header>
                  <h1>{dao} Dashboard</h1>
              </header>
              <p>
                  Loading...
              </p>
            </>
  }

  return (
    <>
      <header>
          <h1>{daoData.name} Dashboard {daoData.icon ? <img src={daoData.icon} alt='DAO icon' className='dao-icon'/>: null}</h1>
      </header>
      <div className='flex flex-row justify-between'>
        <Link className="bm-item menu-item flex-grow medium-margin-right" to='members'>
          <div className='card card-stats'>
            <div className='card-body'>
              <div className='row'>
                <div className='col s5 text-center'>
                  <PeopleAltOutlinedIcon className='icon-big'/>
                  <p className='small'>Members</p>
                </div>
                <div className='col s7 numbers'>
                  <h5>{members}</h5>
                </div>
              </div>
            </div>
          </div>
        </Link>
        <Link className="bm-item menu-item flex-grow medium-margin-right" to='tasks'>
          <div className='card card-stats'>
            <div className='card-body'>
              <div className='row'>
                <div className='col s5 text-center'>
                  <TaskOutlinedIcon className='icon-big'/>
                  <p className='small'>Tasks</p>
                </div>
                <div className='col s7 numbers'>
                  <h5>{tasks}</h5>
                </div>
              </div>
            </div>
          </div>
        </Link>
        <Link className="bm-item menu-item flex-grow medium-margin-right" to='jobs'>
          <div className='card card-stats'>
            <div className='card-body'>
              <div className='row'>
                <div className='col s5 text-center'>
                  <WorkOutlineOutlinedIcon className='icon-big'/>
                  <p className='small'>Jobs</p>
                </div>
                <div className='col s7 numbers'>
                  <h5>{jobs}</h5>
                </div>
              </div>
            </div>
          </div>
        </Link>
        <Link className="bm-item menu-item flex-grow" to='governance'>
          <div className='card card-stats'>
            <div className='card-body'>
              <div className='row'>
                <div className='col s5 text-center'>
                  <WorkOutlineOutlinedIcon className='icon-big'/>
                  <p className='small'>Open Proposals</p>
                </div>
                <div className='col s7 numbers'>
                  <h5>{voting}</h5>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <p className='bigger-font preserve-newline'>
          {daoData.description}
      </p>
    </>
  );
}
