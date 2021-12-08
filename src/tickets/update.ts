import handler from "../util/handler"
import dynamoDb from "../util/dynamodb"
import { Ticket} from './'
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { UpdateItemInput } from "aws-sdk/clients/dynamodb"

export const main = handler(async (event: any, data: Ticket) => {
  const params = {
    TableName: process.env.TICKETS_TABLE_NAME,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      accountId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
      ticketId: event.pathParameters?.id, // The id of the note from the path
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET ticketType = :ticketType, startDate = :startDate, endDate = :endDate, cost = :cost",
    ExpressionAttributeValues: {
      ":ticketType": data.ticketType || null,
      ":startDate": data.startDate || null,
      ":endDate": data.endDate || null,
      ":cost": data.cost || null,
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW",
  } as UpdateItemInput

  await dynamoDb.update(params)

  return { status: true }
})
