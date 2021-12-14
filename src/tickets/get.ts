import { cognitoUtils, dynamoDb, handler } from "../util"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { GetItemInput } from "aws-sdk/clients/dynamodb"
import { ActoraApiClient } from "../clients/actoraApiClient"

export const main = handler(async (event: any) => {

    console.debug(event)
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
    const params = {
        TableName: process.env.TICKETS_TABLE_NAME,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        Key: {
            accountId,
            ticketId: event.pathParameters?.id, // The id of the note from the path
        },
    } as GetItemInput

    const result = await dynamoDb.get(params)
    if (!result.Item) {
        throw new Error("Item not found.")
    }

    console.debug(result.Item)
    // Return the retrieved item
    return result.Item
})

export const state = handler(async (event: any) => {
  const actoraApi = await ActoraApiClient.create()
  return actoraApi.getTicket(event.pathParameters?.id)
})
