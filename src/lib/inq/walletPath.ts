import inquirer from "inquirer"
import { web3 } from "@coral-xyz/anchor"
import os from "os"

const DEFAULT_WALLET_PATH = `${os.homedir()}/.config/velas/id.json`

export default () => {
   const questions = [
      {
         default: DEFAULT_WALLET_PATH,
         name: "walletPath",
         type: "input",
         message: "Enter the path of ledger (usb://ledger) of your wallet file:",
      },
   ]
   return inquirer.prompt(questions)
}
