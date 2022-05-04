import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Form from './Form';
import { Spinner } from 'react-materialize';

const Collection = ({currentUser, onNftMint, contract}) => {
    const [nfts, setNfts] = useState([]);
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
        setNfts(splitArrayIntoChunksOfLen(result.filter(nft => nft.metadata.extra !== "used"), 3));
        setLoaded(true);
      }
      
      fetchData();
  }, [contract, currentUser]);
  
  const splitArrayIntoChunksOfLen = (arr, len) => {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }

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
                   <h1>{currentUser.accountId}'s Collection</h1>
                 </header>
                 
                  {nfts.length > 0
                  ? nfts.map(chunk => 
                    <div className="row">
                      {chunk.map(nft =>
                        <div className="col s4">
                            <div className="card">
                              <div className="card-image">
                                <img src={nft.metadata.media} alt={nft.metadata.title} height="200" className='nft-image'/>
                              </div>
                              <div className="card-title">{nft.metadata.title}</div>
                              <div className="card-content">
                                <p>{nft.metadata.description}</p>
                              </div>
                            </div>
                        </div>)}          
                    </div>)
                  : <p>
                        You do not have any NFTs in your collection. All used NFTs are filtered out in this view.
                    </p>}
                 <h5>Mint a new NFT below.</h5>
                 <Form onNftMint={onNftMint} />
          </>
}

Collection.propTypes = {
  onNftMint: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  contract: PropTypes.shape({
    nft_supply_for_owner: PropTypes.func.isRequired,
    nft_tokens_for_owner: PropTypes.func.isRequired
  })
};

export default Collection;