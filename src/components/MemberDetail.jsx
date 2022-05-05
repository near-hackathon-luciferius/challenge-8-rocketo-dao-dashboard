import React from 'react';
import { useParams } from 'react-router-dom';

const MemberDetail = () => {
  const { dao, member } = useParams();
  
   return <>
                 <header>
                   <h1>{member}'s Details</h1>
                 </header>
                 <p>
                    Member {member} of {dao}.
                 </p>
          </>
}

export default MemberDetail;