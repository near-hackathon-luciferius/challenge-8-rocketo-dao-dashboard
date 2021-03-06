use std::collections::HashMap;
use std::str::FromStr;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{U128, Base58CryptoHash};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, ext_contract, Gas, PromiseResult};
use near_sdk::collections::{UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};

#[macro_use]
extern crate json;

pub type HashId = String;

pub const ROKETO_GAS: Gas = Gas(80_000_000_000_000);
pub const EXT_GAS: Gas = Gas(20_000_000_000_000);
pub const REMAIN_GAS: Gas = Gas(20_000_000_000_000);
pub const ROKETO_CONTRACT: &str = "streaming-r-v2.dcversus.testnet";
pub const NEAR_WRAPPER_CONTRACT: &str = "wrap.testnet";

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
    Completed, //payment stream ended
    Canceled //payment stream ended
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    DaoData
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Account{
    active_incoming_streams: u64,
    active_outgoing_streams: u64,
    inactive_incoming_streams: u64,
    inactive_outgoing_streams: u64,
    total_incoming: HashMap<String, String>,
    total_outgoing: HashMap<String, String>,
    total_received: HashMap<String, String>,
    deposit: String,
    stake: String,
    last_created_stream: Base58CryptoHash,
    is_cron_allowed: bool
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
enum Status {
    Initialized,
    Active,
    Paused,
    Finished(Reason),   
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Reason{
    reason: String
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Stream{
    balance: U128,
    cliff: Option<u64>,
    creator_id: AccountId,
    description: Option<String>,
    id: String,
    is_expirable: bool,
    is_locked: bool,
    last_action: u64,
    owner_id: AccountId,
    receiver_id: AccountId,
    status: Status,
    timestamp_created: u64,
    token_account_id: AccountId,
    tokens_per_sec: U128,
    tokens_total_withdrawn: U128
}

#[ext_contract(ext_roketo_contract)]
trait RoketoContract {
    fn get_account(account_id: AccountId) -> Account;
    fn get_stream(stream_id: Base58CryptoHash) -> Stream;
    fn withdraw(stream_ids: Vec<Base58CryptoHash>);
}

#[ext_contract(ext_wrap_near)]
trait NearContract {
    fn ft_transfer_call(receiver_id: String, amount: String, memo: Option<String>, msg: String) -> U128;
    fn near_deposit();
    fn storage_deposit(account_id: Option<AccountId>);
}

#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn roketo_start_callback(dao_owner: AccountId, job_id: HashId, contracted: AccountId);
    fn roketo_receive_callback(dao_owner: AccountId, job_id: HashId);
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
        //TODO calculate commision
        assert!(env::attached_deposit() >= 10u128.pow(22), "You need to attach at least 0.01 NEAR for operational costs.");

        let mut payment: u128 = job.payment.into();
        payment = payment+10u128.pow(19);
        let duration: u128 = job.payment_cycle_in_s.into();
        let near_per_sec = (payment/duration).to_string();
        env::log_str(format!("Paying {} yoctoNEAR with the speed {} yoctoNEAR/s for {} s", payment, near_per_sec.clone(), duration).as_str());

        let request = object! {
            Create: {
                request: {
                    owner_id: dao_owner.to_string(),
                    receiver_id: contracted.to_string(),
                    tokens_per_sec: near_per_sec.clone(),
                    is_auto_start_enabled: true
                }
            }
        };
        //HACK: json-rust cannot do u128
        let string_request = json::stringify(request).replace(format!("\"{}\"", near_per_sec).as_str(), near_per_sec.as_str());

        let register = ext_wrap_near::storage_deposit(
            None,
            AccountId::from_str(NEAR_WRAPPER_CONTRACT).unwrap(), 
            10u128.pow(22), 
            EXT_GAS);
        let wrap = ext_wrap_near::near_deposit(
            AccountId::from_str(NEAR_WRAPPER_CONTRACT).unwrap(), 
            payment, 
            EXT_GAS);
        let roketo = ext_wrap_near::ft_transfer_call(
            ROKETO_CONTRACT.to_string(), 
            payment.to_string(), 
            Some(format!("Starting job {} of {}.", job.id, dao_owner)), 
            string_request, 
            AccountId::from_str(NEAR_WRAPPER_CONTRACT).unwrap(), 
            1, 
            ROKETO_GAS);
        let account_view = ext_roketo_contract::get_account(
            env::current_account_id(), 
            AccountId::from_str(ROKETO_CONTRACT).unwrap(), 
            0, 
            EXT_GAS);
        let callback = ext_self::roketo_start_callback(
            dao_owner,
            job_id, 
            contracted, 
            env::current_account_id(), 
            0, 
            EXT_GAS);
            
        register.then(wrap).then(roketo).then(account_view).then(callback);
    }

    #[private]
    pub fn roketo_start_callback(
        &mut self, 
        dao_owner: AccountId,
        job_id: HashId, 
        contracted: AccountId,
        #[callback_unwrap] account: Account
    ) {
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get_mut(job_index.unwrap()).unwrap();
        
        job.contracted = Some(contracted.clone());
        job.state = WorkState::InProgress;
        job.payment_stream_id = Some(account.last_created_stream);

        env::log_str(format!("Successfully started the job {} for the contracted {}", job.name, contracted).as_str());
        self.daos.insert(&dao_owner, &dao);
    }

    #[payable]
    pub fn receive_job_payment(
        &mut self,
        dao_owner: AccountId,
        job_id: HashId
    ){
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get(job_index.unwrap()).unwrap();
        assert!(job.state == WorkState::InProgress, "You can only receive payment for jobs that are currently running.");
        assert!(job.contracted == Some(env::predecessor_account_id()), "Only the contracted can receive the payment.");
        assert!(env::attached_deposit() >= 10u128.pow(21), "You need to attach at least 0.001 NEAR for operational costs.");

        let mut ids = Vec::new();
        ids.push(job.payment_stream_id.unwrap());

        let register = ext_wrap_near::storage_deposit(
            Some(job.contracted.as_ref().unwrap().clone()),
            AccountId::from_str(NEAR_WRAPPER_CONTRACT).unwrap(), 
            10u128.pow(22), 
            EXT_GAS);
        let roketo = ext_roketo_contract::withdraw(
            ids, 
            AccountId::from_str(ROKETO_CONTRACT).unwrap(), 
            1, 
            ROKETO_GAS);
        let stream_view = ext_roketo_contract::get_stream(
            job.payment_stream_id.unwrap(), 
            AccountId::from_str(ROKETO_CONTRACT).unwrap(), 
            0, 
            EXT_GAS);
        let callback = ext_self::roketo_receive_callback(
            dao_owner,
            job_id,
            env::current_account_id(), 
            0, 
            EXT_GAS);
        register.then(roketo).then(stream_view).then(callback);
    }

    #[private]
    pub fn roketo_receive_callback(
        &mut self, 
        dao_owner: AccountId,
        job_id: HashId,
        #[callback_unwrap] stream: Stream
    ) {
        let dao_option = self.daos.get(&dao_owner);
        assert!(dao_option.is_some(), "There is no known DAO for {}", dao_owner);
        let mut dao = dao_option.unwrap();
        let job_index = dao.jobs.binary_search_by_key(&job_id, |job| job.id.clone());
        assert!(job_index.is_ok(), "There is no job {:?} in the dao {}", job_id, dao_owner);
        let job = dao.jobs.get_mut(job_index.unwrap()).unwrap();

        match stream.status {
            Status::Initialized => {},
            Status::Active => {},
            Status::Paused => {},
            Status::Finished(result) =>{
                if result.reason == "FinishedNaturally"{
                    job.state = WorkState::Completed;
                }
                else{
                    job.state = WorkState::Canceled;
                }
            }
        }

        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Failed => env::panic_str("Something went wrong during the withdrawl. Maybe the stream was already completed."),
            PromiseResult::Successful(_) => {
                env::log_str(format!("Successfully received available payment for the job {}.", job.name).as_str());
            },
        }
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