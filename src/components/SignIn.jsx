import React from 'react';
import { Button } from 'react-materialize';

export default function SignIn({signIn}) {
  return (
    <>
      <main id="page-wrapper">
        <header>
                      <h1>Kawaii Zoo Homepage</h1>
        </header>
        <Button large onClick={signIn} className='login'>Log in</Button>
        <p>
            This app was developed for the NEAR Spring hackathon. 
            In order to use the app you need to sign in with your NEAR wallet.
        </p>
      </main>
    </>
  );
}
