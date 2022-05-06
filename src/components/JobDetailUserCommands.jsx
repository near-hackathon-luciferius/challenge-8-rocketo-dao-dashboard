import React, {useState, useEffect} from 'react';
import { Button } from 'react-materialize';

const JobDetailUserCommands = ({currentUser, roketoContract, onEnablePayment, stream, onReceivePayment, jobId}) => {
    const [ account, setAccount ] = useState();

    useEffect(() => {
        async function fetchData() {
        const result = await roketoContract.get_account(
        {
            account_id: currentUser.accountId
        });
        console.log(result);
        setAccount(result);
        }

        fetchData();
    }, [currentUser]);

  if(!account){
    return null
  }
  
  if(account.is_cron_allowed){
    return stream && stream.status === 'Active'
            ?<>
                <Button large 
                        tooltip='Receives the available payment.' 
                        onClick={() => onReceivePayment(jobId)}>
                    Receive Payment
                </Button>
            </>
            :null
  }
  
  return <>
            <Button large 
                    tooltip='Enables the payment for the job and all other jobs in the future.' 
                    onClick={onEnablePayment}>
                Enable Payment
            </Button>
        </>
}

export default JobDetailUserCommands;