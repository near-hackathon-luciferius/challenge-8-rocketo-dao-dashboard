import React from 'react';
import { useParams } from 'react-router-dom';
import Iframe from 'react-iframe';

const TasksOverview = ({daoData, loaded}) => {
  const { dao } = useParams();

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
  
   return <>
                 <header>
                   <h1>{daoData.name}'s Tasks Board</h1>
                 </header>
                 <div>
                    <Iframe url={"https://trello.com/b/Ywm3W9HB.html"}
                            position="relative"
                            overflow="hidden"
                            className='mockup-iframe'/>
                  </div>
          </>
}

export default TasksOverview;