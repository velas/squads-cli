#!/usr/bin/env node
import clear from 'clear'
import chalk from 'chalk'

import Menu from "./lib/menu"
import CliWallet from './lib/wallet'
import SetupWallet from "./lib/inq/walletPath"
import SetupCluster from "./lib/inq/cluster"
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { parseLedgerWallet } from "@marinade.finance/ledger-utils"
import * as Default from './lib/constants'
import { Connection } from '@solana/web3.js'

const VERSION = require("../package.json").version

const argv = yargs(hideBin(process.argv)).options({
    cluster: { string: true },
    programId: { string: true, default: Default.PROGRAM_ID },
    programManagerId: { string: true, default: Default.PROGRAM_MANAGER_ID },
    txMetaProgramId: { string: true, default: Default.TXMETA_PROGRAM_ID },
}).parseSync()

const load = async (programId: string, programManagerId: string, txMetaProgramId: string, cluster?: string) => {
    clear()
    console.log(chalk.yellow('Starting Squads CLI...') + " Follow the prompts to get started")
    const {walletPath} = await SetupWallet()
    const ledgerWallet = await parseLedgerWallet(walletPath)
    const cliWallet = new CliWallet(walletPath, ledgerWallet)

    const endpoint = intoUrl(cluster || (await SetupCluster()).cluster)
    const connection = new Connection(endpoint)

    // start the menu
    const cli = new Menu(cliWallet, connection, programId, programManagerId, txMetaProgramId)
    cli.top()
}

const help = async () => {
    clear()
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit:")
    console.log("https://github.com/velas/squads-cli")
    console.log("https://github.com/squads-protocol/squads-cli")
}

function intoUrl(cluster: string) {
    switch (cluster) {
        case "localnet":
            return "http://127.0.0.1:8899"
        case "testnet":
        case "t":
            return "https://api.testnet.velas.com"
        case "mainnet":
        case "m":
            return "https://api.mainnet.velas.com"
        default:
            return Default.CLUSTER
    }
}

if (argv.help) {
    help()
} else if (argv.version || argv.v) {
    console.log(VERSION)
} else {
    clear()
    load(argv.programId, argv.programManagerId, argv.txMetaProgramId, argv.cluster)
}
