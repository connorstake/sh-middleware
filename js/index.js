import { Cosmos } from "@cosmostation/cosmosjs";
import express from 'express';
import bodyParser from "body-parser";
import buy from './handlers/buy';
import queryBalance from './handlers/queryBalance';
import dotenv from 'dotenv'
dotenv.config()



    console.log(process.env.MASTER_MNEMONIC)
    const mnemonic = "receive reject rapid grocery cricket twice obey range report girl duck print embody umbrella census lawsuit twice amount flame wing maid water common despair"
    const chainId = "stakenet";
    const cosmos = new Cosmos("http://0.0.0.0:1317", chainId);
    
    cosmos.setPath("m/44'/118'/0'/0/0");
    
    const address = cosmos.getAddress(mnemonic);
    
    const privKey = cosmos.getECPairPriv(mnemonic);
    const pubKeyAny = cosmos.getPubKeyAny(privKey);

    const app = express()
    app.use(express.json());
    const port = 8080

    const STAKE_TOKEN_PRICE = 1283.25 * 10**6
    const COSMOS_TOKEN_PRICE = 375.82 * 10**6

    app.post('/buy', async (req, res) => {
        const dollarAmount = req.body["dollarAmount"]
        const tokenRequested = req.body["tokenRequested"]
        const msgSender = req.body["msgSender"]
        let price
        if (tokenRequested == "sit") {
            price = STAKE_TOKEN_PRICE
        } else if (tokenRequested == "cit") {
            price = COSMOS_TOKEN_PRICE
        }

        const tokenAmount =  parseInt(String((dollarAmount / price))*10**6)
        const response = await buy(dollarAmount, tokenRequested, tokenAmount, msgSender)
        res.send(response)
    })

    app.post('/balance', async (req, res) => {
        const address = req.body["address"]
        const response = await queryBalance(address)
        res.send(response)
    })

    app.get('/prices', async (req, res) => {
        const prices = {
            sit: STAKE_TOKEN_PRICE / 10**6,
            cit: COSMOS_TOKEN_PRICE / 10**6
        }
        res.send(prices)
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
    
