import { cognitoUtils, dynamoDb, handler } from "../util"
import { QueryInput } from "aws-sdk/clients/dynamodb"
import {Ticket} from '../tickets'
import {inspect} from 'util'
import { Logger, TLogLevelName } from 'tslog'

const log: Logger = new Logger({name: 'tickets.my-tickets', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug'})

export const func = async (event: any): Promise<Ticket[]> => {
  log.debug(inspect(event, {depth: 10}))
  const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
  const params = {
    TableName: process.env.TICKETS_TABLE_NAME,
    KeyConditionExpression: "accountId = :accountId",
    ExpressionAttributeValues: {":accountId": accountId},
  } as QueryInput

  log.debug(params)
  const result = await dynamoDb.query(params)
  // Return the retrieved item
  log.debug(result)
  return result.Items as Ticket[]
}
export const main = handler(func)
