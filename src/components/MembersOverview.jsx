import React from 'react';
import { useParams } from 'react-router-dom';

const MembersOverview = () => {
  const { dao } = useParams();
  
   return <>
                 <header>
                   <h1>{dao}'s Members</h1>
                 </header>
                 <p>
                    Members here.
                 </p>
          </>
}

export default MembersOverview;