import React from 'react';
import { TextInput, Button, Textarea } from 'react-materialize';

export default function JobForm({ onJobCreation }) {
  return (
    <form onSubmit={onJobCreation}>
      <fieldset id="fieldset" className='flex flex-col details-view flex-grow'>
        <div className="highlight flex flex-col">
          <h5>Create a new job offering</h5>
          <p>Add all required parameter for the new job and hit the 'Create' button.</p>
          <TextInput
                  autoComplete="off"
                  autoFocus
                  id="name_prompt"
                  label="The name of the job."
                  required
            />
            <Textarea
                  id="description_prompt"
                  label="A detailed description of the job."
                  required
            />
            <TextInput
                  autoComplete="off"
                  id="payment_prompt"
                  defaultValue={'1'}
                  min="0"
                  step="1"
                  type="number"
                  label="The payment for the job in Ⓝ."
                  required
            />
            <TextInput
                  autoComplete="off"
                  id="duration_prompt"
                  defaultValue={'172800'}
                  min="1"
                  step="1"
                  type="number"
                  label="The duration for the job offer in s."
                  required
            />
        </div>
        <Button type="submit" small
                tooltip="Creates the job and deposits the chosen payment.">
          Create
        </Button>
      </fieldset>
    </form>
  );
}