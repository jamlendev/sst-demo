import handler from "../util/handler"
import dynamoDb from "../util/dynamodb"
import { QueryInput } from "aws-sdk/clients/dynamodb"
import {Ticket} from '../tickets'
import {inspect} from 'util'

export const func = async (event: any): Promise<Ticket[]> => {
  console.log(inspect(event, {depth: 10}))
  const accountId = event.requestContext?.authorizer?.iam.cognitoIdentity.identityId || event.identity?.claims.sub || "69e949fc-77cc-4eb7-af25-63f74f9f5d4d"
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
