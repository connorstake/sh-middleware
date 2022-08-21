import { Cosmos } from "@cosmostation/cosmosjs";
import message from "@cosmostation/cosmosjs/src/messages/proto";
import buy from "./handlers/buy"


export default async function buy(senderMnemonic, dollarAmount, tokenRequested, tokenAmount) {

    const chainId = "stakenet";
    const cosmos = new Cosmos("http://0.0.0.0:1317", chainId);
    
    cosmos.setPath("m/44'/118'/0'/0/0");
    
    const senderAddress = cosmos.getAddress(senderMnemonic);
    
    const privKey = cosmos.getECPairPriv(senderMnemonic);
    const pubKeySender = cosmos.getPubKeyAny(privKey);

    // Send USDC to MASTER WALLET. In Production this would be a swap on a DEX. For early stages, this is emulated via a master wallet
    const usdcSend = await cosmos.getAccounts(address).then(data => {
        // signDoc = (1)txBody + (2)authInfo
        // ---------------------------------- (1)txBody ----------------------------------
        const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
            from_address: senderAddress,
            to_address: process.env.MASTER_ADDRESS,
            amount: [{ denom: "usdc", amount: String(dollarAmount) }]		// 6 decimal places (1000000 uatom = 1 ATOM)
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
            sequence: data.account.sequence
        });
    
        const feeValue = new message.cosmos.tx.v1beta1.Fee({
            amount: [{ denom: "haus", amount: String(14.25) }],
            gas_limit: 200000
        });
    
        const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });
    
        const signedTxBytes = cosmos.sign(txBody, authInfo, data.account.account_number, privKey);
        const txRes = cosmos.broadcast(signedTxBytes).then(response => {return response});
        return txRes
    });
    console.log("USDC TRANSFER: ", res)



    const masterPrivKey = cosmos.getECPairPriv(process.env.MASTER_MNEMONIC);
    const pubKeyMaster = cosmos.getPubKeyAny(masterPrivKey);


    const indexReturn = await cosmos.getAccounts(address).then(data => {
        // signDoc = (1)txBody + (2)authInfo
        // ---------------------------------- (1)txBody ----------------------------------
        const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
            from_address: process.env.MASTER_ADDRESS,
            to_address: senderAddress,
            amount: [{ denom: tokenRequested, amount: String(dollarAmount) }]		// 6 decimal places (1000000 uatom = 1 ATOM)
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
            sequence: data.account.sequence
        });
    
        const feeValue = new message.cosmos.tx.v1beta1.Fee({
            amount: [{ denom: "haus", amount: String(tokenAmount) }],
            gas_limit: 200000
        });
    
        const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });
    
        const signedTxBytes = cosmos.sign(txBody, authInfo, data.account.account_number, masterPrivKey);
        const txRes = cosmos.broadcast(signedTxBytes).then(response => {return response});
        return txRes
    });
    console.log("TOKEN TRANSFER: ", res)
    return res
}

