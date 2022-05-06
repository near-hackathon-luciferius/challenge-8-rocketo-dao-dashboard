import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import DaoCreationForm from './DaoCreationForm';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'; 
import { Link } from 'react-router-dom';
import { Button } from 'react-materialize';

export default function CreateDao({version, currentUser, contract, onDaoCreation}) {
  const navigate = useNavigate();
  const [ ownsDao, setOwnsDao ] = useState(false);
  const [ loaded, setLoaded ] = useState(false);
  const [ daos, setDaos ] = useState([]);
  
  useEffect(() => {
      async function fetchData() {
        const result = await contract.get_daos({ });
        console.log(result);
        setOwnsDao(result.includes(currentUser.accountId));
        setDaos(result);
        setLoaded(true);
      }
      
      fetchData();
  }, [contract, currentUser]);

  const goToDao = (target) => {
    navigate(target);
  }

  return (
    <>
      <main id="page-wrapper">
        <header>
            <h1>NEAR Challenge #8 - DAO Dashboard - {version}</h1>
        </header>
        {loaded
        ? <div className='flex flex-row-wrap justify-between margin-row-small'>
            {ownsDao
            ?<Button large 
                    onClick={() => goToDao(currentUser.accountId)}>
                <div className='flex flex-row'>
                  <div className='min-margin-right'><ArrowForwardOutlinedIcon className='btn-icon'/></div>
                  <div>Got To Your DAO</div>
                </div>
            </Button>
            :<DaoCreationForm onDaoCreation={onDaoCreation}/>}
          </div>
        : null}
        <div className='text-bigger'>
          <p>
              This app solves the problem, that today DAOs have no centeral place for management.
              They have a central point of communication - which is Discord, but they have a heap
              of other tools for task management (trello), job postings (website), payment handling
              (manual), voting (snapshot) and drafting documents (google docs).
          </p>
          <p>
              This app combines all DAO related task into one unified DAO Management tool.
          </p>
          <ol>
            <li>You can manage you DAO members and their roles which synchronizes with your Discord Server.</li>
            <li>
              You can manage, discuss, assign and provide payment for tasks. Tasks are payed in full
              after completion.
            </li>
            <li>
              You can post job offerings, where your members can apply for the jobs. The payment is powered by
              <a href='https://www.roke.to/'>Roketo's</a> innovative money streaming. So your members get paid
              while they work.
            </li>
            <li>
              You can draft proposals for you whole community to vote on.
            </li>
          </ol>
          <p>
              All DAOs get their own custom website. If you are interested in seeing how that looks in real life,
              click on one of the existing DAOs down below and check their DAO Dashboard.
          </p>
        </div>
        <h5>All Existing DAOs</h5>
        <div className='flex flex-col'>
          {daos.length > 0
          ? daos.map(dao => 
              <Link className='margin-row-small text-bigger bm-item menu-item flex flex-row' to={dao}>
                <div className='min-margin-right'><ArrowForwardOutlinedIcon className='btn-icon'/></div>
                <div>{dao}</div>
              </Link>)
          :null}
        </div>
      </main>
    </>
  );
}
