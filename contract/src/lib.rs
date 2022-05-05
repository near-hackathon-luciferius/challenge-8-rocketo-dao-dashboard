use std::str::FromStr;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{U128, Base58CryptoHash};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, ext_contract, Gas};
use near_sdk::collections::{UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};

pub type HashId = String;

pub const ROKETO_GAS: Gas = Gas(30_000_000_000_000);
pub const REMAIN_CALL_GAS: Gas = Gas(10_000_000_000_000);

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
    pub daos: UnorderedMap<AccountId, DaoData>
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct DaoData{
    pub name: String,
    pub description: String,
    pub icon: String,
    pub jobs: Vec<JobData>
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct JobData{
    pub id: HashId,
    pub name: String,
    pub description: String,
    pub state: WorkState,
    pub payment: U128,
    pub payment_cycle_in_s: U128,
    pub applicants: Vec<ApplicationData>,
    pub contracted: Option<AccountId>,
    pub payment_stream_id: Option<Base58CryptoHash>
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ApplicationData{
    pub applicant: AccountId,
    pub application: String
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub enum WorkState {
    Open, //waiting for applicants
    InProgress, //executing the task
    Canceled, //ended without payment or partial payment
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    DaoData
}

#[ext_contract(ext_roketo_contract)]
trait RoketoContract {
    fn create_stream(
        description: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_name: String,
        tokens_per_tick: U128,
        is_auto_deposit_enabled: bool,
        is_auto_start_enabled: bool,
    ) -> Base58CryptoHash;
    fn stop_stream(
        stream_id: Base58CryptoHash
    ) -> bool;
}

#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn roketo_start_callback(dao_owner: AccountId, job_id: HashId, contracted: AccountId);
    fn roketo_end_callback(dao_owner: AccountId, job_id: HashId);
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            daos: UnorderedMap::new(StorageKey::DaoData),
        }
    }

    #[payable]
    pub fn create_dao(
        &mut self,
        dao_owner_id: AccountId, 
        name: String, 
        description: String,
        icon: String
    ) -> Option<DaoData>{
        assert!(env::attached_deposit() >= 10*10u128.pow(24), "Creating a DAO account costs 10 NEAR.");
        let dao: DaoData = DaoData {
            name,
            description,
            icon,
            jobs: Vec::new()
        };
        env::log_str(format!("Successfully created a DAO for {}", dao_owner_id).as_str());
        self.daos.insert(&dao_owner_id, &dao)
    }

    #[payable]
    pub fn create_job_offering(
        &mut self,
        name: String,
        description: String,
        payment: U128,
        payment_cycle_in_s: U128
    ) -> JobData{
        let dao_owner = env::predecessor_account_id();
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let payment_amount: u128 = payment.into();
        //TODO consider storage cost
        assert!(env::attached_deposit() >= payment_amount, "You need to attach enough near to cover for the payment.");
        let job: JobData = JobData{
            name,
            description,
            payment,
            payment_cycle_in_s,
            state: WorkState::Open,
            applicants: Vec::new(),
            contracted: None,
            payment_stream_id: None,
            id: env::block_height().to_string()
        };
        dao.jobs.push(job.clone());
        env::log_str(format!("Successfully created a job for the {}", dao.name).as_str());
        self.daos.insert(&dao_owner, &dao);
        job
    }

    pub fn apply_for_job(
        &mut self,
        dao_owner: AccountId,
        job_id: HashId,
        application: String
    ){
        //TODO consider storage cost
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get_mut(job_index.unwrap()).unwrap();
        assert!(job.state == WorkState::Open, "You can only apply to an open job.");

        job.applicants.push(ApplicationData { 
            applicant: env::predecessor_account_id(), 
            application
        });
        env::log_str(format!("Successfully applied for the job {} for {}", job.name, dao.name).as_str());
        self.daos.insert(&dao_owner, &dao);
    }

    #[payable]
    pub fn start_job(
        &mut self,
        job_id: HashId,
        contracted: AccountId
    ){
        //TODO consider storage cost
        let dao_owner = env::predecessor_account_id();
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get(job_index.unwrap()).unwrap();
        assert!(job.state == WorkState::Open, "You can only start jobs that are not currently running.");
        assert!(env::attached_deposit() >= 10u128.pow(22), "You need to attach at least 0.01 NEAR for operational costs.");

        let mut payment: u128 = job.payment.into();
        payment = payment+10u128.pow(22);
        let mut duration: u128 = job.payment_cycle_in_s.into();
        duration = duration*10u128.pow(9);
        let near_per_tick = U128::from(payment/duration);

        let roketo = ext_roketo_contract::create_stream(
            Some(job.description.clone()), 
            dao_owner.clone(), 
            contracted.clone(), 
            "NEAR".to_string(), 
            near_per_tick, 
            false, 
            true,
            AccountId::from_str("dev-1635510732093-17387698050424").unwrap(), 
            payment, 
            ROKETO_GAS);
        let gas = env::prepaid_gas() - env::used_gas() - ROKETO_GAS - REMAIN_CALL_GAS;
        let callback = ext_self::roketo_start_callback(
            dao_owner,
            job_id, 
            contracted, 
            env::current_account_id(), 
            0, 
            gas);
        roketo.then(callback);
    }

    #[private]
    pub fn roketo_start_callback(
        &mut self, 
        dao_owner: AccountId,
        job_id: HashId, 
        contracted: AccountId,
        #[callback_unwrap] roketo_hash: Base58CryptoHash
    ) {
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get_mut(job_index.unwrap()).unwrap();
        
        job.contracted = Some(contracted.clone());
        job.state = WorkState::InProgress;
        job.payment_stream_id = Some(roketo_hash);

        env::log_str(format!("Successfully started the job {} for the contracted {}", job.name, contracted).as_str());
        self.daos.insert(&dao_owner, &dao);
    }

    #[payable]
    pub fn cancel_job(
        &mut self,
        job_id: HashId
    ){
        //TODO consider storage cost
        let dao_owner = env::predecessor_account_id();
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get(job_index.unwrap()).unwrap();
        assert!(job.state == WorkState::InProgress, "You can only cancel job that are currently running.");
        assert!(env::attached_deposit() >= 10u128.pow(21), "You need to attach at least 0.001 NEAR for operational costs.");

        let roketo = ext_roketo_contract::stop_stream(
            job.payment_stream_id.unwrap(), 
            AccountId::from_str("dev-1635510732093-17387698050424").unwrap(), 
            10u128.pow(21), 
            ROKETO_GAS);
        let gas = env::prepaid_gas() - env::used_gas() - ROKETO_GAS - REMAIN_CALL_GAS;
        let callback = ext_self::roketo_end_callback(
            dao_owner,
            job_id,
            env::current_account_id(), 
            0, 
            gas);
        roketo.then(callback);
    }

    #[private]
    pub fn roketo_end_callback(
        &mut self, 
        dao_owner: AccountId,
        job_id: HashId, 
        #[callback_unwrap] success: bool
    ) {
        assert!(success, "Roketo failed to cancel the job. Maybe the stream already ended.");
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get_mut(job_index.unwrap()).unwrap();
        
        let contracted = job.contracted.as_ref().unwrap().clone();
        job.contracted = None;
        job.state = WorkState::Canceled;
        job.payment_stream_id = None;

        env::log_str(format!("Successfully canceled the job {} for the contracted {}", job.name, contracted).as_str());
        self.daos.insert(&dao_owner, &dao);
    }

    pub fn get_dao(
        &self,
        dao_owner: AccountId
    ) -> DaoData{
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        dao_option.unwrap()
    }

    pub fn get_daos(
        &self
    ) -> Vec<AccountId>{
        self.daos.keys_as_vector().to_vec()
    }

    pub fn clear(
        &mut self
    ) {
        assert_eq!(self.owner_id, env::predecessor_account_id(), "Only owner can clear the state.");
        self.daos.clear();
    }
}