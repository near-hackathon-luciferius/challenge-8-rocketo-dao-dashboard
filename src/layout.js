import React from 'react';
import { Outlet } from 'react-router-dom'
import { Button } from 'react-materialize';
import PropTypes from 'prop-types';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import Popup from './components/Popup';

const Layout = ({currentUser, signIn, signOut, clearMessage, message}) => {
  return (
    <>
      <div id="App">
          <Outlet/>
          { currentUser
            ? <Button onClick={signOut} floating large className='btn-login' icon={<AccountBalanceWalletIcon fontSize="large" className="btn-icon" />} tooltip={'Log out ' + currentUser.accountId + '.'} />
            : <Button onClick={signIn} floating large className='btn-login' icon={<BrokenImageIcon fontSize="large" className="btn-icon" />} tooltip='Log in using NEAR wallet.' />
          }        
          {message && <Popup
            content={<>
              <b>A message for you</b>
              <p>{message}</p>
            </>}
            handleClose={clearMessage}
          />}
      </div>
    </>
  );
};

Layout.propTypes = {
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired
};

export default Layout;