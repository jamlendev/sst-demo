import { APIGatewayProxyEventV2 } from "aws-lambda"
import * as uuid from "uuid"
import { PutItemInput } from "aws-sdk/clients/dynamodb"
import { cognitoUtils, dynamoDb, handler } from "../util"
import { TicketInput, ticketTypes } from './'
import moment from 'moment'

export const main = handler(async (event: any, data: TicketInput) => {
  data = data || event.arguments.request
  const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)

  const ticketType = ticketTypes[data.ticketType]
  const endDate = moment(data.startDate).add({days: ticketType.expires});

/*
  fetch the card for the isrn
  make fulfillment request to actora
  store status and ref
  */

  const params = {
    TableName: process.env.TICKETS_TABLE_NAME,
    Item: {
      accountId,
      ticketId: uuid.v4(),
      ticketType,
      startDate: moment(data.startDate).format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      cost: ticketType.cost,
      createdAt: Date.now(),
      status: 'Requested',
      externalRef: uuid.v4(),
    },
  } as PutItemInput

  await dynamoDb.put(params)
  return params.Item
})
