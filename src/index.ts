#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';

import Menu from "./lib/menu.js";
import CliWallet from './lib/wallet.js';
import CliConnection from "./lib/connection.js";
import SetupWallet from "./lib/inq/walletPath.js";
import SetupCluster from "./lib/inq/cluster.js";
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers'
import {parseLedgerWallet} from "@marinade.finance/ledger-utils";
import { PROGRAM_ID, PROGRAM_MANAGER_PROGRAM_ID, TXMETA_PROGRAM_ID, DEFAULT_CLUSTER } from './lib/constants.js';

const VERSION = "2.1.3";

const argv = yargs(hideBin(process.argv)).options({
    cluster: { type: 'string'},
    programId: { type: 'string'},
    programManagerId: { type: 'string'},
    txMetaProgramId: { type: 'string'},
  }).parseSync();

const load = async (programId: string, programManagerId: string, txMetaProgramId: string, initCluster?: string) => {
    clear();
    console.log(chalk.yellow('Starting Squads CLI...') + " Follow the prompts to get started")
    const {walletPath} = await SetupWallet();
    const ledgerWallet = await parseLedgerWallet(walletPath)
    const cliWallet = new CliWallet(walletPath, ledgerWallet);
    let cliConnection;
    if(!initCluster){
        const {cluster} = await SetupCluster();
        cliConnection = new CliConnection(cluster);
    }else{
        cliConnection = new CliConnection(initCluster);
    }

    // start the menu
    const cli = new Menu(cliWallet, cliConnection, programId, programManagerId, txMetaProgramId);
    cli.top();
};

const help = async () => {
    clear();
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit https://github.com/squads-protocol/squads-cli");
};

let cluster;
let programId;
let programManagerId;
let txMetaProgramId;
if (argv.cluster && argv.cluster.length > 0){
    cluster = argv.cluster;
}
if (argv.programId && argv.programId.length > 0){
    programId = argv.programId;
} else {
    programId = PROGRAM_ID
}
if (argv.programManagerId && argv.programManagerId.length > 0){
    programManagerId = argv.programManagerId;
} else {
    programManagerId = PROGRAM_MANAGER_PROGRAM_ID
}
if (argv.txMetaProgramId && argv.txMetaProgramId.length > 0) {
    txMetaProgramId = argv.txMetaProgramId;
} else {
    txMetaProgramId = TXMETA_PROGRAM_ID
}

if (argv.help){
    help();
}else if (argv.version || argv.v){
    console.log(VERSION);
}else {
    clear();
    load(programId, programManagerId, txMetaProgramId, cluster);
}
