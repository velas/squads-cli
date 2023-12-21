#!/usr/bin/env node
import clear from 'clear'
import chalk from 'chalk'

import Menu from "./lib/menu"
import CliWallet from './lib/wallet'
import CliConnection from "./lib/connection"
import SetupWallet from "./lib/inq/walletPath"
import SetupCluster from "./lib/inq/cluster"
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { parseLedgerWallet } from "@marinade.finance/ledger-utils"
import * as Default from './lib/constants'

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
    const cliConnection = cluster ? new CliConnection(cluster) : new CliConnection((await SetupCluster()).cluster)

    // start the menu
    const cli = new Menu(cliWallet, cliConnection, programId, programManagerId, txMetaProgramId)
    cli.top()
}

const help = async () => {
    clear()
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit:")
    console.log("https://github.com/squads-protocol/squads-cli")
    console.log("https://github.com/velas/squads-cli")
}

if (argv.help) {
    help()
} else if (argv.version || argv.v) {
    console.log(VERSION)
} else {
    clear()
    load(argv.programId, argv.programManagerId, argv.txMetaProgramId, argv.cluster)
}
