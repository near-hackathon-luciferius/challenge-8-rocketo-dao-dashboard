import React from 'react';
import { useParams } from 'react-router-dom';

const TaskDetail = () => {
  const { dao, task } = useParams();
  
   return <>
                 <header>
                   <h1>{task}'s Details</h1>
                 </header>
                 <p>
                    Task {task} of {dao}.
                 </p>
          </>
}

export default TaskDetail;