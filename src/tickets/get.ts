import handler from "../util/handler"
import dynamoDb from "../util/dynamodb"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { GetItemInput } from "aws-sdk/clients/dynamodb"

export const main = handler(async (event: any) => {

  console.log(event)
  const accountId = event.requestContext?.authorizer.iam.cognitoIdentity.identityId || event.identity.claims.sub
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

  console.log(result.Item)
  // Return the retrieved item
  return result.Item
})
