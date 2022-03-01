import { PutItemInput } from "aws-sdk/clients/dynamodb"
import dynamoDb from "../util/dynamodb"
import { EventBridge } from "aws-sdk"

const client = new EventBridge()

export async function main(event: any) {
    const accountId = event.requestContext?.authorizer.iam.cognitoIdentity.identityId
    const data = event.request.userAttributes
    console.log('postAuth trigger', event, data, accountId)
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
