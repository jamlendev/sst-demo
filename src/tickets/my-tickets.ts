import { cognitoUtils, dynamoDb, handler } from "../util"
import { QueryInput } from "aws-sdk/clients/dynamodb"
import {Ticket} from '../tickets'
import {inspect} from 'util'

export const func = async (event: any): Promise<Ticket[]> => {
  console.debug(inspect(event, {depth: 10}))
  const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
  const params = {
    TableName: process.env.TICKETS_TABLE_NAME,
    KeyConditionExpression: "accountId = :accountId",
    ExpressionAttributeValues: {":accountId": accountId},
  } as QueryInput

  const result = await dynamoDb.query(params)
  // Return the retrieved item
  return result.Items as Ticket[]
}
export const main = handler(func)
