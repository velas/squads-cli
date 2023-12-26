import { Commitment, Connection, PublicKey, StakeProgram } from "@solana/web3.js"
import { deserialize } from "borsh-neu"
import { StructType } from "borsh-neu/lib/types/types"

export interface StakeAccount {
   address: PublicKey,
   executable: boolean,
   lamports: number,
   rentEpoch?: number,
   data: StakeData
}

export async function getStakeAccountsByWithdrawer(conn: Connection, withdrawer: PublicKey, commitment?: Commitment): Promise<StakeAccount[]> {
   const WITHDRAW_AUTHORITY_OFFSET = 0x2C
   const rawStakeAccounts = await conn.getProgramAccounts(StakeProgram.programId, {
      filters: [{
         memcmp: {
            offset: WITHDRAW_AUTHORITY_OFFSET,
            bytes: withdrawer.toBase58(),
         },
      }], 
      commitment
   })

   return rawStakeAccounts.map(raw => ({
      address: raw.pubkey,
      lamports: raw.account.lamports,
      executable: raw.account.executable,
      rentEpoch: raw.account.rentEpoch,
      data: parseStakeAccountData(raw.account.data)
   }))
}

export async function getStakeAccount(conn: Connection, address: PublicKey, commitment?: Commitment): Promise<StakeAccount> {
   const account = await conn.getAccountInfo(address, commitment)
   
   return {
      address,
      lamports: account!.lamports,
      executable: account!.executable,
      rentEpoch: account!.rentEpoch,
      data: parseStakeAccountData(account!.data)
   }
}

/**
 * Parse raw bytes of Stake Account Data into structured object
 * @param stakeAccountData raw Stake Account data
 * @throws if met unknown enum variant ID or unexpected end of buffer
 */
export function parseStakeAccountData(stakeAccountData: Buffer): StakeData {
   const variant = stakeAccountData.readUint8()

   switch (variant) {
      case 0:
         return {
            kind: "uninitialized",
         } as Uninitialized
      case 1:
         return {
            kind: "initialized",
            ...deserialize(VARIANT_INITIALIZED_SCHEMA, stakeAccountData.subarray(4)) as Object
         } as Initialized
      case 2:
         return {
            kind: "stake",
            ...deserialize(VARIANT_STAKE_SCHEMA, stakeAccountData.subarray(4)) as Object
         } as Delegated
      case 3:
         return {
            kind: "rewardsPool"
         } as RewardsPool
      default:
         throw new Error("Unknown enum variant in stake account: " + variant)
   }
}

type StakeData = Uninitialized | Initialized | Delegated | RewardsPool

interface Uninitialized {
   kind: "uninitialized",
}

interface Initialized {
   kind: "initialized",
   meta: Meta,
}
interface Delegated {
   kind: "stake",
   meta: Meta,
   stake: Stake,
}

interface RewardsPool {
   kind: "rewardsPool",
}

interface Meta {
   /** Lamports */
   rentExemptReserve: bigint,
   authorized: Authorized,
   lockup: Lockup,
}

interface Stake {
   delegation: Delegation,
   /** credits observed is credits from vote account state when delegated or redeemed */
   creditsObserved: bigint,
}

interface Delegation {
   /** to whom the stake is delegated */
   voterPubkey: Array<32>,
   /** activated stake amount, set at delegate() time */
   stake: bigint,
   /** epoch at which this stake was activated, std::Epoch::MAX if is a bootstrap stake */
   activationEpoch: bigint,
   /** epoch the stake was deactivated, std::Epoch::MAX if not deactivated */
   deactivationEpoch: bigint,
   /** how much stake we can activate per-epoch as a fraction of currently effective stake */
   warmupCooldownRate: number,
}

interface Authorized {
   staker: Array<32>,
   withdrawer: Array<32>,
}

interface Lockup {
   unixTimestamp: bigint,
   epoch: bigint,
   custodian: Array<32>,
}

const META_SCHEMA: StructType = {
   struct: {
      rentExemptReserve: 'u64',
      authorized: {
         struct: {
            staker: {
               array: { type: 'u8', len: 32 }
            },
            withdrawer: {
               array: { type: 'u8', len: 32 }
            }
         }
      },
      lockup: {
         struct: {
            unixTimestamp: 'i64',
            epoch: 'u64',
            custodian: { array: { type: 'u8', len: 32 } }
         }
      }
   }
}

const STAKE_SCHEMA: StructType = {
   struct: {
      delegation: {
         struct: {
            voterPubkey: { array: { type: 'u8', len: 32 } },
            stake: 'u64',
            activationEpoch: 'u64',
            deactivationEpoch: 'u64',
            warmupCooldownRate: 'f64',
         }
      },
      creditsObserved: 'u64',
   }
}

const VARIANT_INITIALIZED_SCHEMA: StructType = {
   struct: {
      meta: META_SCHEMA
   }
}

const VARIANT_STAKE_SCHEMA: StructType = {
   struct: {
      meta: META_SCHEMA,
      stake: STAKE_SCHEMA
   }
}
