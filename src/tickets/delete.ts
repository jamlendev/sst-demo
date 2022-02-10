import handler from "../util/handler"
import dynamoDb from "../util/dynamodb"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { DeleteItemInput } from "aws-sdk/clients/dynamodb"
import { Logger, TLogLevelName } from 'tslog'

const log: Logger = new Logger({name: 'tickets.delete', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug'})

export const main = handler(async (event: any) => {
  const params = {
    TableName: process.env.TICKETS_TABLE_NAME,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      accountId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
      ticketId: event.pathParameters?.id, // The id of the note from the path
    },
  } as DeleteItemInput
  log.debug(params)
  await dynamoDb.delete(params)
  return { status: true }
})
