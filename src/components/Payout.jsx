import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spinner, Carousel, Button } from 'react-materialize';
import { Link } from 'react-router-dom';

const Payout = ({currentUser, contract, onPayout}) => {
  const [sets, setSets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
      async function fetchData() {
        const count = await contract.nft_supply_for_owner({account_id: currentUser.accountId});
        const result = await contract.nft_tokens_for_owner(
        {
            account_id: currentUser.accountId,
            from_index: "0",
            limit: parseInt(count)
        });
        console.log(result);
        analyseSets(result);
        setLoaded(true);
      }

      function analyseSets(nfts) {
        const completeSets = [];
        analyse(nfts, ["11", "12", "13", "14", "15"], completeSets);
        analyse(nfts, ["21", "22", "23", "24", "25"], completeSets);
        analyse(nfts, ["31", "32", "33", "34", "35"], completeSets);
        analyse(nfts, ["41", "42", "43", "44", "45"], completeSets);
        analyse(nfts, ["51", "52", "53", "54", "55"], completeSets);
        analyse(nfts, ["11", "21", "31", "41", "51"], completeSets);
        analyse(nfts, ["12", "22", "32", "42", "52"], completeSets);
        analyse(nfts, ["13", "23", "33", "43", "53"], completeSets);
        analyse(nfts, ["14", "24", "34", "44", "54"], completeSets);
        analyse(nfts, ["15", "25", "35", "45", "55"], completeSets);
        setSets(completeSets);
      }

      function analyse(nfts, template, completeSets) {
        const set = [];
        template.forEach(ele => {
          const nft = nfts.find(n => n.metadata.extra === ele);
          if(nft){
            set.push(nft);
          }
        });
        if(set.length === template.length){
          completeSets.push(set);
        }
      }
      
      fetchData();
  }, [contract, currentUser]);

  if(!loaded){
    return <>
              <header>
                <h1>Available sets.</h1>
              </header>
              <h1>Loading...</h1>
              <Spinner />
          </>
  }
  
   return <>
                 <header>
                   <h1>Cash Out Completed Sets</h1>
                 </header>
                 
                  {sets.length > 0
                  ? sets.map(chunk => 
                        <>
                          <div className='row  valign-wrapper center'>
                            <div className='col s1'>
                              <Button small tooltip='Payout the set. This will invalidate the set, making the NFTs unusable.'
                                      onClick={e => onPayout(chunk.map(nft => nft.token_id))}>
                                Payout
                              </Button>
                            </div>
                            <div className='col s11'>
                              <Carousel>
                                {chunk.map(nft =>
                                  <img src={nft.metadata.media} alt={nft.metadata.title} height="200" className='nft-image'/>)}          
                              </Carousel>
                            </div>
                          </div>
                        </>)
                  : <p>
                        You do not have any complete sets yet. Head over to <Link className="menu-item" to="/collection">your collection</Link> and 
                        mint some more animals. Good luck! 🍀
                    </p>}
          </>
}

Payout.propTypes = {
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  contract: PropTypes.shape({
    nft_supply_for_owner: PropTypes.func.isRequired,
    nft_tokens_for_owner: PropTypes.func.isRequired
  }),
  onPayout: PropTypes.func.isRequired
};

export default Payout;