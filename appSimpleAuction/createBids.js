/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');


var newOfferId = "";
const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';




//ProcessEnv 
async function main() {
    process.DISCOVERY_AS_LOCALHOST = 'false';
    var eventSubmitted = false;
    try {
        
        
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        //console.log(`Wallet path: ${walletPath}`);

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




        let transaction;
        let listener;
        var tempTest = "";
        eventSubmitted = false;
        var eventSubmitted2 = false;
        let temptest;
        
        try {

            listener = async (event) => {

                const newOfferFromEvent = JSON.parse(event.payload.toString());
                console.log(Object(newOfferFromEvent)["id"]);
                const stringifynewOfferFromEvent =  JSON.stringify(newOfferFromEvent.ID);
                console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${JSON.stringify(newOfferFromEvent)}${RESET}`);
                // show the information available with the event
                console.log(`*** Event: ${event.eventName}:${newOfferFromEvent}`);
                newOfferId = Object(newOfferFromEvent)["id"];
                //tempTest = JSON.parse(JSON.stringify(newOfferFromEvent));
                console.log(`*** offer ID: ${newOfferId}`);
                // notice how we have access to the transaction information that produced this chaincode event
                const eventTransaction = event.getTransactionEvent();
                console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
                // notice how we have access to the full block that contains this transaction
                const eventBlock = eventTransaction.getBlockEvent();
                console.log(`*** block: ${eventBlock.blockNumber.toString()}`);
                console.log(`*** before eventSubmitted: ${eventSubmitted}`);
                eventSubmitted = true;
                console.log(`*** after eventSubmitted: ${eventSubmitted}`);
                process.env.DISCOVERY_AS_LOCALHOST = 'true';
                transaction = contract.createTransaction('CreateBid');
                await transaction.submit("1", newOfferId, '100');
                console.log(`${GREEN}--> Submit Transaction: Createbid 1 value 100 for offer , ${newOfferId}${RESET}`);

                await transaction.submit("2", newOfferId, '50');
                console.log(`${GREEN}--> Submit Transaction: Createbid 5 value 50 for offer , ${newOfferId}${RESET}`);

                await transaction.submit("3", newOfferId, '150');
                console.log(`${GREEN}--> Submit Transaction: Createbid 3 value 150 for offer , ${newOfferId}${RESET}`);
                await gateway.disconnect();
                //await sleep(5000);

            };


        await contract.addContractListener(listener,"newOfferCreated");

        } catch (eventError) {
                console.log(`${RED}<-- Failed: Setup contract events - ${eventError}${RESET}`);
            }
        /*
        if (eventSubmitted){
            try {
                // C R E A T E    B I D
                console.log(`${GREEN}--> Submit Transaction: Createbid 10 for offer , ${newOfferId}${RESET}`);
                transaction = contract.createTransaction('CreateBid');
                await transaction.submit("10", newOfferId, '100');
                console.log(`${GREEN}<-- Submit CreateAsset Result: committed, asset ${newOfferId}${RESET}`);
                
                await transaction.submit("11", newOfferId, '50');
                console.log(`${GREEN}<-- Submit CreateAsset Result: committed, asset ${newOfferId}${RESET}`);
                
                await transaction.submit("12", newOfferId, '150');
                console.log(`${GREEN}<-- Submit CreateAsset Result: committed, asset ${newOfferId}${RESET}`);
                process.DISCOVERY_AS_LOCALHOST='true';
                await gateway.disconnect();
            } catch (createError) {
                console.log(`${RED}<-- Submit Failed: CreateAsset - ${createError}${RESET}`);
            }    
        } else{console.log(`${RED}<-- if else eventSubmitted - ${eventSubmitted}${RESET}`);}
        */

        //await contract.submitTransaction('CreateBid',"6", "offer_123", "17");
        //console.log(`Transaction has been evaluated, result is: CreateBid 6, OfferID: ${newOfferId} `);



        // Disconnect from the gateway.
        //await gateway.disconnect();

    } catch (error) {
        console.error(`end of code Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}



main();