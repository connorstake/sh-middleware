import { Cosmos } from "@cosmostation/cosmosjs";
import message from "@cosmostation/cosmosjs/src/messages/proto";
import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'

export default async function queryBalance(address) {

    const res = await axios.get('http://localhost:1317/cosmos/bank/v1beta1/balances/' + address)
    .then(function (response) {
        // handle success
        return response.data.balances
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })

    console.log(res)
    return res
}