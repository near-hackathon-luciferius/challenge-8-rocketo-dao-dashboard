import React, {useState} from 'react';
import { Button, TextInput } from 'react-materialize';
import { useNavigate } from "react-router-dom";

const JobDetailAdminCommands = ({jobData, onCancelJob, onStartJob, stream}) => {
    const [contracted, setContracted] = useState();
    const navigate = useNavigate();

    const changeContracted = e => {
        setContracted(e.target.value);
    }

    const goToApplications = () => {
        navigate("applications");
    }

  if(!jobData){
    return null
  }

  switch(jobData.state){
      case 'InProgress':
          if(stream && stream.state !== 'Active'){
              return null;
          }
          return <>
                    <Button large 
                            tooltip='Canceles the payment an the job offering. Important: A new job has to be created afterwards.' 
                            onClick={() => onCancelJob(jobData.payment_stream_id)}>
                        Cancel Contract
                    </Button>
                 </>
      case 'Open':
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
                            className={contracted ?'medium-margin-right':'medium-margin-right disabled'}>
                                Assign Contracted And Start
                    </Button>
                    <Button large 
                            onClick={goToApplications}>
                                View Applications
                    </Button>
                 </>
      default: return null;
  }
}

export default JobDetailAdminCommands;