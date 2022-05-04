/*!
Non-Fungible Token implementation with JSON serialization.
NOTES:
  - The maximum balance value is limited by U128 (2**128 - 1).
  - JSON calls should pass U128 as a base-10 string. E.g. "100".
  - The contract optimizes the inner trie structure by hashing account IDs. It will prevent some
    abuse of deep tries. Shouldn't be an issue, once NEAR clients implement full hashing of keys.
  - The contract tracks the change in storage before and after the call. If the storage increases,
    the contract requires the caller of the contract to attach enough deposit to the function call
    to cover the storage cost.
    This is done to prevent a denial of service attack on the contract by taking all available storage.
    If the storage decreases, the contract will issue a refund for the cost of the released storage.
    The unused tokens from the attached deposit are also refunded, so it's safe to
    attach more deposit than required.
  - To prevent the deployed contract from being modified or deleted, it should not have any access
    keys on its account.
*/

use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, UnorderedMap};
use near_sdk::json_types::Base64VecU8;
use near_sdk::{
    env, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    metadata_templates: UnorderedMap<u64, TokenMetadata>
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Svg Vector Icons : http://www.onlinewebfonts.com/icon --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E %3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 1000 1000' enable-background='new 0 0 1000 1000' xml:space='preserve'%3E %3Cmetadata%3E Svg Vector Icons : http://www.onlinewebfonts.com/icon %3C/metadata%3E %3Cg%3E%3Cg transform='translate(0.000000,511.000000) scale(0.100000,-0.100000)'%3E%3Cpath d='M2917.9,4516.9c-581.4-198.5-878-936.4-672.5-1678.9c98.1-354.9,273.2-649.1,520.7-875.7c726.2-665.5,1660.3-361.9,1849.4,600.1c105.1,532.4-79.4,1146.5-469.4,1559.8C3774.8,4514.5,3331.2,4657,2917.9,4516.9z'/%3E%3Cpath d='M6469.5,4528.5c-224.2-74.7-368.9-165.8-551.1-336.3c-551.1-525.4-726.2-1368.4-413.3-2003.5c326.9-665.5,1116.1-777.6,1706.9-242.8c254.5,228.8,427.3,511.4,527.7,854.6c212.5,737.9-42.1,1454.8-604.8,1702.3C6969.2,4572.9,6644.7,4586.9,6469.5,4528.5z'/%3E%3Cpath d='M8641.2,1976.3c-457.7-72.4-894.3-511.4-1074.1-1083.5c-72.4-231.2-91.1-686.5-37.3-931.7c175.1-786.9,859.3-1186.2,1501.5-880.3c611.8,294.2,985.4,1134.9,835.9,1889.1c-46.7,226.5-189.1,523.1-326.9,677.2C9304.3,1908.6,8979.7,2027.7,8641.2,1976.3z'/%3E%3Cpath d='M872.3,1934.2c-266.2-98.1-467-294.2-614.1-595.4c-385.3-791.6-35-1903.1,707.5-2258c768.3-364.3,1534.2,263.9,1534.2,1254c0,688.9-329.3,1282-861.7,1545.8c-161.1,79.4-191.5,86.4-408.6,91.1C1042.8,1978.6,968.1,1969.3,872.3,1934.2z'/%3E%3Cpath d='M4704.2,885.8c-198.5-70.1-378.3-193.8-544.1-371.3c-191.5-203.1-270.9-359.6-399.3-786.9c-137.8-462.3-263.9-693.5-565.1-1046.1c-249.8-287.2-436.7-415.6-1062.5-721.6c-467-226.5-590.8-296.5-695.9-397c-233.5-219.5-347.9-558.1-296.6-861.6c84.1-464.7,504.4-885,1020.4-1015.8c217.2-53.7,354.9-44.4,1195.6,93.4c889.7,147.1,1160.5,175.1,1641.6,175.1c481,0,751.9-30.4,1639.2-175.1c432-70.1,845.3-128.4,922.4-128.4c572.1,0,1162.9,460,1281.9,1001.8c74.7,331.6-32.7,674.8-280.2,910.7c-105.1,98.1-231.1,170.5-695.8,397c-733.2,357.3-938.7,516.1-1261,971.4c-172.8,242.8-261.6,434.3-369,796.3c-137.8,457.7-207.8,590.8-432,817.3c-144.8,144.8-228.8,210.2-371.3,280.2c-165.8,79.4-203.2,88.7-397,95.7C4874.7,927.8,4795.3,918.5,4704.2,885.8z'/%3E%3C/g%3E%3C/g%3E %3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    Templates
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract owned by `owner_id` with
    /// default metadata (for example purposes only).
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "Kawaii Animals".to_string(),
                symbol: "ANIMAL".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut templates: UnorderedMap<u64, TokenMetadata> = UnorderedMap::new(StorageKey::Templates);
        for color in 1..6{
            for animal in 1..6{
                let id: u64 = (color-1)*5+animal-1;
                let url: String = format!("https://raw.githubusercontent.com/near-hackathon-luciferius/challenge-6-resources/main/a{}{}.png",color,animal);
                let hash: Base64VecU8 = "RTBEMDBDNjZGODk1RTlEOEEyMTQzNjUyRjlCMUJGNEQ1MEU2NjQxNEM0RUI5NDQzMzdGRTcwMTk5NDFEMjkzQQ==".as_bytes().to_vec().into(); //fixed for now
                let extra: String = format!("{}{}",color,animal);
                let description: String = "Part of 25 unique NFTs that can create 10 distinctive sets - 5 sets for same color and 5 different animals and 5 sets for same animal in 5 different colors. Collect'em all.".into();
                let metadata_template = TokenMetadata {
                    title: None,
                    description: Some(description),
                    media: Some(url),
                    media_hash: Some(hash),
                    copies: Some(1u64),
                    issued_at: None,
                    expires_at: None,
                    starts_at: None,
                    updated_at: None,
                    extra: Some(extra),
                    reference: None,
                    reference_hash: None,
                };
                templates.insert(&id, &metadata_template);
            }
        }
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
                
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            metadata_templates: templates
        }
    }

    /// Mint a new token with ID=`token_id` belonging to `token_owner_id`.
    ///
    /// Since this example implements metadata, it also requires per-token metadata to be provided
    /// in this call. `self.tokens.mint` will also require it to be Some, since
    /// `StorageKey::TokenMetadata` was provided at initialization.
    ///
    /// `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
    /// initialization call to `new`.
    #[payable]
    pub fn nft_mint(
        &mut self,
        token_owner_id: AccountId
    ) -> Token {
        assert!(env::predecessor_account_id().as_str() == "kawaii-zoo-game.cryptosketches.testnet", "Can only be called by kawaii-zoo-game.cryptosketches.testnet.");
        let rand: u8 = *env::random_seed().get(0).unwrap();
        let index: u64 = (rand as u64)*25u64/256u64;
        let total_supply: u128 = self.tokens.nft_total_supply().into();
        let token_id = (total_supply+1u128).to_string();
        let mut metadata = self.metadata_templates.get(&index).clone().unwrap();
        metadata.title = Some(format!("Kawaii Animal #{}", &token_id));
        self.tokens.internal_mint(token_id, token_owner_id, Some(metadata))
    }

 /*   
    #[payable]
    pub fn test_mint(
        &mut self,
        token_owner_id: AccountId,
        index: u64
    ) -> Token {
        assert!(env::predecessor_account_id().as_str() == "kawaii-zoo-game.cryptosketches.testnet", "Can only be called by kawaii-zoo-game.cryptosketches.testnet.");
        let total_supply: u128 = self.tokens.nft_total_supply().into();
        let token_id = (total_supply+1u128).to_string();
        let mut metadata = self.metadata_templates.get(&index).clone().unwrap();
        metadata.title = Some(format!("Kawaii Animal #{}", &token_id));
        self.tokens.internal_mint(token_id, token_owner_id, Some(metadata))
    } 
*/

    pub fn get_nfts(
        &self, 
        nft_ids: Vec<u64>
    ) -> Vec<Token>{
        let mut result: Vec<Token> = Vec::new();
        for id in nft_ids.iter(){
            let token_opt = self.nft_token(id.to_string());
            match token_opt{
                Some(token) => result.push(token),
                None => env::panic_str(format!("Token {} was not minted yet.", id).as_str())
            };
        }
        result
    }

    pub fn invalidate_nfts(
        &mut self, 
        nft_ids: Vec<u64>
    ){
        assert!(env::predecessor_account_id().as_str() == "kawaii-zoo-game.cryptosketches.testnet", "Can only be called by kawaii-zoo-game.cryptosketches.testnet.");

        for id in nft_ids.iter(){
            let mut metadata = self.nft_token(id.to_string()).unwrap().metadata.unwrap();
            metadata.title = Some("Used".into());
            metadata.description = Some("This NFT was already used".into());
            metadata.media = Some("https://raw.githubusercontent.com/near-hackathon-luciferius/challenge-6-resources/main/used.png".into());
            metadata.extra = Some("used".into());
            self.tokens.token_metadata_by_id.as_mut().unwrap().insert(&id.to_string(), &metadata);
        }
    }

    pub fn clear_templates(
        &mut self
    ) {
        assert_eq!(self.tokens.owner_id, env::predecessor_account_id(), "Only owner can clear the state.");
        self.metadata_templates.clear();
        for kv in self.tokens.owner_by_id.iter(){
            self.tokens.token_metadata_by_id.as_mut().unwrap().remove(&kv.0);
            self.tokens.approvals_by_id.as_mut().unwrap().remove(&kv.0);
        }
        self.tokens.owner_by_id.clear();
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}