import { Cosmos } from "@cosmostation/cosmosjs";
import message from "@cosmostation/cosmosjs/src/messages/proto";
import express from 'express';
import bodyParser from "body-parser";



    const mnemonic = "receive reject rapid grocery cricket twice obey range report girl duck print embody umbrella census lawsuit twice amount flame wing maid water common despair"
    const chainId = "stakenet";
    const cosmos = new Cosmos("http://0.0.0.0:1317", chainId);
    
    cosmos.setPath("m/44'/118'/0'/0/0");
    
    const address = cosmos.getAddress(mnemonic);
    
    const privKey = cosmos.getECPairPriv(mnemonic);
    const pubKeyAny = cosmos.getPubKeyAny(privKey);

    const app = express()
    const port = 8080

    app.post('/send', async (req, res) => {
        req.body
        const response = await testSend()
        res.send(response)
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
    
    async function testSend() {
        const res = await cosmos.getAccounts(address).then(data => {
            // signDoc = (1)txBody + (2)authInfo
            // ---------------------------------- (1)txBody ----------------------------------
            const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
                from_address: address,
                to_address: "cosmos13nakdpl03jp4wqedxq5hwx5na034fyflmyyvqe",
                amount: [{ denom: "haus", amount: String(100) }]		// 6 decimal places (1000000 uatom = 1 ATOM)
            });
        
            const msgSendAny = new message.google.protobuf.Any({
                type_url: "/cosmos.bank.v1beta1.MsgSend",
                value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
            });
        
            const txBody = new message.cosmos.tx.v1beta1.TxBody({ messages: [msgSendAny], memo: "" });
        
            // --------------------------------- (2)authInfo ---------------------------------
            const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
                public_key: pubKeyAny,
                mode_info: { single: { mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT } },
                sequence: data.account.sequence
            });
        
            const feeValue = new message.cosmos.tx.v1beta1.Fee({
                amount: [{ denom: "haus", amount: String(10) }],
                gas_limit: 200000
            });
        
            const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });
        
            const signedTxBytes = cosmos.sign(txBody, authInfo, data.account.account_number, privKey);
            const txRes = cosmos.broadcast(signedTxBytes).then(response => {return response});
            return txRes
        });
        console.log("ANSWER: ", res)
        return res
    }

