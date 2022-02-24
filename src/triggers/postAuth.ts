import { PutItemInput } from "aws-sdk/clients/dynamodb"
import dynamoDb from "../util/dynamodb"
// import { ActoraApiClient } from '../clients/actoraApiClient'
import { EventBridge } from "aws-sdk"

const client = new EventBridge()
// const actoraApi = ActoraApiClient.create()

export async function main(event: any) {
    const accountId = event.requestContext?.authorizer.iam.cognitoIdentity.identityId
    console.log('postAuth trigger', event, accountId)
    const data = event.request.userAttributes
    // // actually want to publish an event to say they have auth'd
    // // then a subscriber would fire off to ACT to create the customer
    // // and then update the cognito record with the externalRef

    // const api = await actoraApi
    // const { externalRef } = await api.customerRegister({
    //   forename: data.given_name,
    //   surname: data.family_name,
    // })
    // // const card = await actoraApi.cardRequest({
    // //   cardType: 'adult',
    // //   card
    // // })
    const params = {
        TableName: process.env.CUSTOMERS_TABLE_NAME,
        Item: {
            accountId: data.sub,
            firstName: data.given_name,
            lastName: data.family_name,
        },
    } as PutItemInput

    await dynamoDb.put(params)
    client.putEvents({
        Entries: [{
            EventBusName: process.env.BUS_NAME,
            Source: "tfgm.ticketing",
            DetailType: "CustomerCreated",
            Detail: JSON.stringify({
                accountId: data.sub,
                firstName: data.given_name,
                lastName: data.family_name,
            })
        }]
    })
        .promise()
        .catch(console.error)
    return event
}
