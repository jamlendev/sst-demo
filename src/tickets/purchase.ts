import { APIGatewayProxyEventV2 } from "aws-lambda"
import * as uuid from "uuid"
import { PutItemInput } from "aws-sdk/clients/dynamodb"
import handler from "../util/handler"
import dynamoDb from "../util/dynamodb"
import { TicketInput, ticketTypes } from './'
import moment from 'moment'

export const main = handler(async (event: any, data: TicketInput) => {
  data = data || event.arguments.request
  const accountId = event.requestContext?.authorizer?.iam.cognitoIdentity.identityId || event.identity?.claims.sub || "69e949fc-77cc-4eb7-af25-63f74f9f5d4d"

  const ticketType = ticketTypes[data.ticketType]
  const endDate = moment(data.startDate).add({days: ticketType.expires});

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      accountId,
      ticketId: uuid.v4(), // A unique uuid
      ticketType, // Parsed from request body
      startDate: moment(data.startDate).format('YYYY-MM-DD'), // Parsed from request body
      endDate: endDate.format('YYYY-MM-DD'),
      cost: ticketType.cost,
      createdAt: Date.now(), // Current Unix timestamp
    },
  } as PutItemInput

  await dynamoDb.put(params)
  return params.Item
})
