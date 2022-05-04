import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as nearAPI from 'near-api-js';
import Big from 'big.js';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const Dashboard = ({version, nearConfig}) => {
  const [loaded, setLoaded] = useState(false);
  const [gameTreasury, setGameTreasury] = useState('');
  const [gamePayout, setGamePayout] = useState('');
  const [donationTreasury, setDonationTreasury] = useState('');

  useEffect(() => {
      async function fetchData() {
        const gameBalance = await getAccountBalance(nearConfig.contractName);
        const dontationBalance = await getAccountBalance(nearConfig.donationAccountName);
        
        setDonationTreasury(Big(dontationBalance).div(10 ** 24).minus(100).toFixed(2));
        setGameTreasury(Big(gameBalance).div(10 ** 24).minus(100).toFixed(2));
        setGamePayout(Big(gameBalance).div(10 ** 24).minus(100).div(2).toFixed(2));
        setLoaded(true);
      }

      async function getAccountBalance(accountName) {
        const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
        const near = await nearAPI.connect({ keyStore, ...nearConfig });
        const gameAccount = await near.account(accountName);
        const gameBalance = await gameAccount.getAccountBalance();
        return gameBalance.total;
      }
      
      fetchData();
  }, [nearConfig]);

   return <>
                 <header>
                   <h1>NEAR Challenge #8 - DAO Dashboard - {version}</h1>
                 </header>
                 {loaded
                 //?<h5>Game Treasury: {gameTreasury} Ⓝ - Next Payout: {gamePayout} Ⓝ - Donated Amount: {donationTreasury} Ⓝ</h5>
                 ? <div className='row'>
                    <div className='col s4'>
                      <div className='card card-stats'>
                        <div className='card-body'>
                          <div className='row'>
                            <div className='col s5 text-center'>
                              <AccountBalanceIcon className='icon-big'/>
                              <p className='small'>Game Treasury</p>
                            </div>
                            <div className='col s7 numbers'>
                              <h5>{gameTreasury} Ⓝ</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col s4'>
                      <div className='card card-stats'>
                        <div className='card-body'>
                          <div className='row'>
                            <div className='col s5 text-center'>
                              <CardGiftcardIcon className='icon-big'/>
                              <p className='small'>Next Payout</p>
                            </div>
                            <div className='col s7 numbers'>
                              <h5>{gamePayout} Ⓝ</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col s4'>
                      <div className='card card-stats'>
                        <div className='card-body'>
                          <div className='row'>
                            <div className='col s5 text-center'>
                              <VolunteerActivismIcon className='icon-big'/>
                              <p className='small'>Donated Amount</p>
                            </div>
                            <div className='col s7 numbers'>
                              <h5>{donationTreasury} Ⓝ</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                 :null}
                  <p>
                      This app was developed for the NEAR Spring hackathon. It demonstrate how donations for Ukrainian Zoos can be 
                      collected using a simple NFT-based set collection game.
                  </p>
                  <p>
                      Here is how the app works. Everyone can mint animal NFTs. These animals come in 5 colors and 5 different animals.
                      Each animal costs exactly 1 NEAR. 0.2 NEAR are directly donated to a donation account. The remaining 0.8 NEAR go
                      to the apps treasury.
                  </p>
                  <p>
                      This app is a set collection game. You need to either collect 5 differnt animals in the same color or one animal
                      in 5 differnt colors. Once you have a completed set you can cash out from the games treasury. In this demonstration
                      you simply get 50% of the treasury. When a set is cashed out, the NFTs are invalided. They are still owned by the
                      user, but unusable for a cash out.
                  </p>
                  <p>
                      They idea behind that was, that in order get donations you need to create incentives. The incentive here is basically
                      a game of luck. In average a user needs to mint more than 5 animals to get a complete set. But a lucky user will get
                      a complete set with minting only 5 animals. This user might then cash out more then he put into the game.
                  </p>
                  <p>
                      Of course in a real world scenario the dynamic of the rewards need to be adjusted to make the game fair and fun.
                      Additonally there are possiblities for more income streams to the tresury/donation account in form of external NFT 
                      market place fees/royalty or additional NFTs like color changing food.
                  </p>
                 <h5>Head over to <Link className="menu-item" to="/collection">your collection</Link> to mint 
                     you first animal or go to <Link className="menu-item" to="/payout">payout</Link> to
                     see your complete sets and cash them out.
                 </h5>
             </>
}

Dashboard.propTypes = {
  version: PropTypes.string.isRequired
};

export default Dashboard;