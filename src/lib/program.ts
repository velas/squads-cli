import * as anchor from "@coral-xyz/anchor"
import { Connection, LAMPORTS_PER_SOL, PublicKey, StakeProgram, SystemProgram } from "@solana/web3.js"
import BN from "bn.js"
import programId from "./inq/programId"
const BPFLOADER_ADDRESS = new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")

const getParsed = (account: any) => {
   const { value } = account
   if (value && value.data && "parsed" in value.data) {
      const {
         data: { parsed },
      } = value
      return parsed
   }
   return null
}

export const getParsedProgramAccount = async (
   connection: Connection,
   programAddress: PublicKey,
) => {
   const programAccountInfo = await connection.getParsedAccountInfo(programAddress)
   return getParsed(programAccountInfo)
}

export const getProgramDataAccount = async (
   connection: Connection,
   programDataAddress: PublicKey,
) => {
   return connection.getParsedAccountInfo(programDataAddress)
}

export const getProgramData = async (connection: Connection, programAddress: PublicKey) => {
   const programDataAddress = await getProgramDataAddress(programAddress)
   const programAccountInfo = await connection.getParsedAccountInfo(programDataAddress)
   const parsed = getParsed(programAccountInfo)
   return parsed
}

export const getProgramDataAddress = async (programAddress: PublicKey) => {
   const [programDataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [programAddress.toBytes()],
      BPFLOADER_ADDRESS,
   )
   return programDataAddress
}

export const upgradeSetAuthorityIx = async (
   programAddress: PublicKey,
   currentAuthorityAddress: PublicKey,
   newAuthorityAddress: PublicKey,
) => {
   const upgradeProgramId = BPFLOADER_ADDRESS
   const upgradeData = new BN(4, 10)
   const [programDataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [programAddress.toBuffer()],
      upgradeProgramId,
   )
   const keys = [
      { pubkey: programDataAddress, isWritable: true, isSigner: false },
      { pubkey: currentAuthorityAddress, isWritable: false, isSigner: true },
      { pubkey: newAuthorityAddress, isWritable: false, isSigner: true },
   ]
   return new anchor.web3.TransactionInstruction({
      programId: upgradeProgramId,
      data: upgradeData.toArrayLike(Buffer, "le", 4),
      keys,
   })
}




export const getInstructionProgram = (
   programId: PublicKey,
) => {

   if (programId.equals(StakeProgram.programId)) {
      return "Stake"
   } else if (programId.equals(SystemProgram.programId)) {
      return "System"
   }
   else {
      return `Unknown(${programId.toBase58().slice(0, 6)})`
   }
}

const stakeDecoder = (stakeInstruction: Buffer, keys: any[]) => {
   const variant = stakeInstruction.readUint8()

   switch (variant) {
      case 0:
         return "initialize"
      case 1:
         return "authorize"
      case 2:
         return "delegateStake"
      case 3:
         return "split"
      case 4:
         return `Withdraw stake ${Number(stakeInstruction.subarray(4).readBigUInt64LE()) / LAMPORTS_PER_SOL} from ${keys[0].pubkey.toBase58()} to ${keys[1].pubkey.toBase58()}`
      case 5:
         return "deactivate"
      default:
         throw new Error("Unknown enum variant in stake instruction: " + variant)
   }
}
const systemDecoder = (systemInstruction: Buffer, keys: any[]) => {
   const variant = systemInstruction.readUint8()

   switch (variant) {
      case 0:
         return "createAccount"
      case 1:
         return "assign(..)"
      case 2:
         return `transfer ${Number(systemInstruction.subarray(4).readBigUInt64LE()) / LAMPORTS_PER_SOL
            } from ${keys[0].pubkey.toBase58()} to ${keys[1].pubkey.toBase58()} `
      default:
         throw new Error("Unknown enum variant in system instruction: " + variant)
   }
}


const noopDecoder = (data: Buffer, keys: any[]) => {
   return `Unknown instruction: ${data.toString('base64')} `
}

export const getInstructionDecoder = (
   programId: PublicKey,
) => {
   if (programId.equals(StakeProgram.programId)) {
      return stakeDecoder
   } else if (programId.equals(SystemProgram.programId)) {
      return systemDecoder
   }
   else {
      return noopDecoder
   }
}
