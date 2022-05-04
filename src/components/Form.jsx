import React from 'react';
import PropTypes from 'prop-types';
import { Range, Button } from 'react-materialize';

export default function Form({ onNftMint }) {
  return (
    <form onSubmit={onNftMint}>
      <fieldset id="fieldset">
        <div className="highlight">
          <p>Select the amount of animals you want to mint. Each animal costs 1 Ⓝ.</p>
          <Range id="amount" min="1" max="7"/>
        </div>
        <Button type="submit" small
                tooltip="Mint the chosen amount of animals.">
          Mint!
        </Button>
      </fieldset>
    </form>
  );
}

Form.propTypes = {
  onNftMint: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};