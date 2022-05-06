import React from 'react';
import { TextInput, Button, Textarea } from 'react-materialize';

export default function ApplicationForm({ onApplyForJob, jobId }) {
  return (
    <form onSubmit={onApplyForJob}>
      <fieldset id="fieldset" className='flex flex-col details-view flex-grow'>
        <div className="highlight flex flex-col">
          <h5>Apply for the job</h5>
          <p>Write your most inspiring application down below.</p>
          <TextInput
                autoComplete="off"
                id="job_id"
                label="The job ID. Do not change it!"
                required
                inputClassName='disabled'
                value={jobId}
          />
          <Textarea
                autoFocus
                id="application_prompt"
                label="Here is the space for your amazing application."
                required
          />
        </div>
        <Button type="submit" small
                tooltip="Applies for the job. In order to change your application simply fill the form again.">
          Apply
        </Button>
      </fieldset>
    </form>
  );
}