import { Cosmos } from "@cosmostation/cosmosjs";
import message from "@cosmostation/cosmosjs/src/messages/proto";
import dotenv from 'dotenv'
dotenv.config()
import userdb from '../userdb.json' assert {type: 'json'};

export default async function buy(dollarAmount, tokenRequested, tokenAmount, msgSender) {

    const chainId = "stakenet";
    const cosmos = new Cosmos("http://0.0.0.0:1317", chainId);
    
    cosmos.setPath("m/44'/118'/0'/0/0");
    console.log(userdb)
    
    const privKey = cosmos.getECPairPriv(userdb["users"][msgSender]["mnemonic"]);
    const pubKeySender = cosmos.getPubKeyAny(privKey);


    // Send USDC to MASTER WALLET. In Production this would be a swap on a DEX. For early stages, this is emulated via a master wallet
    const usdcSend = await cosmos.getAccounts(msgSender).then(data => {

        // signDoc = (1)txBody + (2)authInfo
        // ---------------------------------- (1)txBody ----------------------------------
        const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
            from_address: msgSender,
            to_address: process.env.MASTER_ADDRESS,
            amount: [{ denom: "usdc", amount: String(Math.floor(dollarAmount)) }]		// 6 decimal places (1000000 uatom = 1 ATOM)
        });
    
        const msgSendAny = new message.google.protobuf.Any({
            type_url: "/cosmos.bank.v1beta1.MsgSend",
            value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
        });
    
        const txBody = new message.cosmos.tx.v1beta1.TxBody({ messages: [msgSendAny], memo: "" });
    
        // --------------------------------- (2)authInfo ---------------------------------
        const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
            public_key: pubKeySender,
            mode_info: { single: { mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT } },
            // @ts-ignore
            sequence: data.account.sequence
        });
    
        const feeValue = new message.cosmos.tx.v1beta1.Fee({
            amount: [{ denom: "haus", amount: String(10) }],
            gas_limit: 200000
        });
    
        const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });
    
        // @ts-ignore
        const signedTxBytes = cosmos.sign(txBody, authInfo, data.account.account_number, privKey);
        const txRes = cosmos.broadcast(signedTxBytes).then(response => {return response});
        return txRes
    });
    console.log("USDC TRANSFER: ", usdcSend)



    const masterPrivKey = cosmos.getECPairPriv(process.env.MASTER_MNEMONIC);
    const pubKeyMaster = cosmos.getPubKeyAny(masterPrivKey);


    const indexReturn = await cosmos.getAccounts(process.env.MASTER_ADDRESS).then(data => {
        // signDoc = (1)txBody + (2)authInfo
        // ---------------------------------- (1)txBody ----------------------------------
        const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
            from_address: process.env.MASTER_ADDRESS,
            to_address: msgSender,
            amount: [{ denom: tokenRequested, amount: String(tokenAmount) }]		// 6 decimal places (1000000 uatom = 1 ATOM)
        });
    
        const msgSendAny = new message.google.protobuf.Any({
            type_url: "/cosmos.bank.v1beta1.MsgSend",
            value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
        });
    
        const txBody = new message.cosmos.tx.v1beta1.TxBody({ messages: [msgSendAny], memo: "" });
    
        // --------------------------------- (2)authInfo ---------------------------------
        const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
            public_key: pubKeyMaster,
            mode_info: { single: { mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT } },
            // @ts-ignore
            sequence: data.account.sequence
        });
    
        const feeValue = new message.cosmos.tx.v1beta1.Fee({
            amount: [{ denom: "haus", amount: String(10) }],
            gas_limit: 200000
        });
    
        const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });
    
        // @ts-ignore
        const signedTxBytes = cosmos.sign(txBody, authInfo, data.account.account_number, masterPrivKey);
        const txRes = cosmos.broadcast(signedTxBytes).then(response => {return response});
        return txRes
    });
    console.log("TOKEN TRANSFER: ", indexReturn)
    return indexReturn
}

