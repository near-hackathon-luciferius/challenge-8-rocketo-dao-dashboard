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
        <p>
            Description of idea.
        </p>
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
