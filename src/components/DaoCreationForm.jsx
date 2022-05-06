import React from 'react';
import { TextInput, Button, Textarea } from 'react-materialize';

export default function DaoCreationForm({ onDaoCreation }) {
  return (
    <form onSubmit={onDaoCreation}>
      <fieldset id="fieldset" className='flex flex-col details-view flex-grow'>
        <div className="highlight flex flex-col">
          <h5>Create a new DAO</h5>
          <p>
             Hint: If you are looking for an existing DAO scroll down to see the list of all existing DAOs. <br/>
             Add all required parameter for the new job and hit the 'Create' button.
          </p>
            <TextInput
                  autoComplete="off"
                  autoFocus
                  id="name_prompt"
                  label="The name of your DAO."
                  required
            />
            <Textarea
                  id="description_prompt"
                  label="A detailed description of your DAO."
                  required
            />
            <TextInput
                  autoComplete="off"
                  id="icon_prompt"
                  label="An URL to you DAO icon. Optional."
            />
        </div>
        <Button type="submit" small
                tooltip="Creates the DAO. This will costs 10 Ⓝ.">
          Create
        </Button>
      </fieldset>
    </form>
  );
}