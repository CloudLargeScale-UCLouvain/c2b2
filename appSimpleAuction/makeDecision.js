/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('simpleAuction');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        //const result = await contract.submitTransaction('QueryOffer','offer_1');
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);


        const result = await contract.submitTransaction('MakeDecision','offer_1000');
        console.log(`Transaction has been evaluated, "MakeDecision"`);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        /*
        await contract.submitTransaction('CreateBid',"6", "offer_123", "17");
        console.log(`Transaction has been evaluated, result is: `);

        await contract.submitTransaction('CreateBid',"7", "offer_123", "7");
        console.log(`Transaction has been evaluated, result is: `);

        await contract.submitTransaction('CreateBid',"8", "offer_123", "77");
        console.log(`Transaction has been evaluated, result is: `);
        */

        //await contract.submitTransaction('CreateOffer',"offer_123", "");
        //console.log(`Transaction has been evaluated, result is: `);

        //const result3 = await contract.submitTransaction('QueryBid',"Bid_4");
        //console.log(`Transaction has been evaluated, result is: ${result3.toString()}`);


        //await contract.evaluateTransaction('CreateOffer','offer_2', '');
        //console.log(`Transaction has been evaluated, "CreateOffer"`);

/*
        await contract.submitTransaction('QueryOffer', '1565');
        console.log('Transaction "QueryOffer" has been submitted');


        await contract.submitTransaction('createBid', '1', '1', '5');
        console.log('Transaction "createBid" has been submitted');


        await contract.submitTransaction('createBid', '2', '1', '3');
        console.log('Transaction "createBid" has been submitted');


        await contract.submitTransaction('createBid', '3', '1', '10');
        console.log('Transaction "createBid" has been submitted');
*/
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
