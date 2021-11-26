import { PutItemInput } from "aws-sdk/clients/dynamodb"
import * as uuid from "uuid"
import dynamoDb from "../util/dynamodb"

export async function main(event: any) {
  console.log('postAuth trigger', event)
  const data = event.request.userAttributes
  const externalRef = uuid.v4()
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      accountId: data.sub,
      firstName: data.given_name,
      lastName: data.family_name,
      externalRef,
    },
  } as PutItemInput

  await dynamoDb.put(params)
  return event
}
