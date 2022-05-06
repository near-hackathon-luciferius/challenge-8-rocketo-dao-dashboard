import React from 'react';
import { useParams } from 'react-router-dom';
import Iframe from 'react-iframe';

const Voting = ({daoData, loaded}) => {
  const { dao } = useParams();

  if(!loaded){
    return <>
              <header>
                  <h1>{dao} Governance</h1>
              </header>
              <p>
                  Loading...
              </p>
            </>
  }
  
   return <>
                 <header>
                   <h1>{daoData.name} Governance</h1>
                 </header>
                 <div>
                    <Iframe url={"https://snapshot.org/#/sushigov.eth"}
                            position="relative"
                            overflow="hidden"
                            className='mockup-iframe'/>
                  </div>
          </>
}

export default Voting;