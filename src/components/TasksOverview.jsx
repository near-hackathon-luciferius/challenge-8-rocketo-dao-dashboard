import React from 'react';
import { useParams } from 'react-router-dom';

const TasksOverview = () => {
  const { dao } = useParams();
  
   return <>
                 <header>
                   <h1>{dao}'s Tasks Board</h1>
                 </header>
                 <p>
                    Tasks here.
                 </p>
          </>
}

export default TasksOverview;