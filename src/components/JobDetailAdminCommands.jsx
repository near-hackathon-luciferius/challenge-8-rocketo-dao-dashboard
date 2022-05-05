import React, {useState} from 'react';
import { Button, TextInput } from 'react-materialize';

const JobDetailAdminCommands = ({jobData, onCancelJob, onStartJob}) => {
    const [contracted, setContracted] = useState();

    const changeContracted = e => {
        setContracted(e.target.value);
    }

  if(!jobData){
    return null
  }

  switch(jobData.state){
      case 'InProgress':
          return <Button large tooltip='Canceles the payment an the job offering. Important: A new job has to be created afterwards.' onClick={() => onCancelJob(jobData.id)}>Cancel Contract</Button>
      default:
          return <>
                    <div className="flex flex-col flex-grow medium-margin-right">
                        <TextInput
                            autoComplete="off"
                            label="NEAR account id of the contracted."
                            onChange={changeContracted}
                        />
                    </div>
                    <Button large 
                            tooltip='Assigns the contracted and starts the job immediately.' 
                            onClick={() => onStartJob(jobData.id, contracted)}
                            className={contracted ?'':'disabled'}>
                                Assign Contracted And Start
                    </Button>
                 </>
  }
}

export default JobDetailAdminCommands;