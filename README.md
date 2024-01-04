```
   _____   ____    __  __   ___     ____    _____
  / ___/  / __ \  / / / /  /   |   / __ \  / ___/
  \__ \  / / / / / / / /  / /| |  / / / /  \__ \
 ___/ / / /_/ / / /_/ /  / ___ | / /_/ /  ___/ /
/____/  \___\_\ \____/  /_/  |_|/_____/  /____/

```

## Squads CLI

Interact with the Squads Multisig Program through a simple CLI.

### Requirements

Nodejs version >= 20
Yarn version === 1.22 OR NPM version >= 10

### Installing the CLI tool

`npm install -g @velas/multisig-cli`

### Running the tool

Running the simple command will start the tool and ask a few setup questions for the wallet and the network cluster.\
`squads-cli`

### Cluster Option

Providing the cluster will bypass the question upon startup\
`squads-cli --cluster https://api.mainnet.velas.com`

### Future 

1. VLX Amount with float

2. Get instruction data
2.1 get ix pda in transaction (api.getInstructions(txPda))
2.2 get account from blockchain by ixpda (squads.getInstruction(ixPda))
2.3 get decoder by instruction.programID (system | stake): decoder is `fn(bytes) -> JSON`
2.4 use decoder(instruction.data) to get json of instruction
2.5 print json as table

3. Stake: list accounts
4. Create transaction -> Show TxPDA