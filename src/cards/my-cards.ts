import { cognitoUtils, dynamoDb, handler } from "../util"
import { ActoraApiClient } from '../clients/actoraApiClient'
import { GetItemInput, QueryInput } from "aws-sdk/clients/dynamodb"

export const func = async (event: any): Promise<any> => {
    const actoraApi = await ActoraApiClient.create()
    /*
      Get externalRef from dynamoDb Customers using accountId
      send get request to actora with
      */
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
    const params = {
        TableName: process.env.CUSTOMERS_TABLE_NAME,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        Key: {
            accountId,
        },
    } as GetItemInput

    const customer = await dynamoDb.get(params)
    console.debug(accountId, customer)
    const externalRef = customer?.Item?.externalRef
    const result = await actoraApi.getCards(externalRef)
    return result
}

export const main = handler(func)

export const temp = handler(async (event: any): Promise<any> => {
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)

    const params = {
        TableName: process.env.CARDS_TABLE_NAME,
        KeyConditionExpression: "accountId = :accountId",
        ExpressionAttributeValues: { ":accountId": accountId },
    } as QueryInput

    const result = await dynamoDb.query(params)
    // Return the retrieved item

    // console.debug(result.Items)
    return result.Items
})
