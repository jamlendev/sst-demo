import { APIGatewayProxyEventV2 } from "aws-lambda"
import * as uuid from "uuid"
import { PutItemInput } from "aws-sdk/clients/dynamodb"
import { cognitoUtils, dynamoDb, handler } from "../util"
import { customerProfileService, cardService } from '../services'
import { TicketInput, ticketTypes } from './'
import moment from 'moment'
import { ActoraApiClient } from "../clients/actoraApiClient"
import { Card, CardStatus } from "../services/cardService"
import { Logger, TLogLevelName } from 'tslog'

const log: Logger = new Logger({ name: 'tickets.purchase', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug' })

export const main = handler(async (event: any, data: TicketInput) => {
    const actoraApi = await ActoraApiClient.create()
    data = data || event.arguments.request
    log.debug(data)
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)

    const ticketType = ticketTypes[data.ticketType]
    const startDate = moment(data.startDate)
    const endDate = moment(data.startDate).add({ days: ticketType.expires });

  const customer = await customerProfileService.getCustomer(event.requestContext?.authorizer.iam.cognitoIdentity)
    const ticketRequest = await actoraApi.ticketRequest({
        customerRef: customer.externalRef,
        card: { isrn: data.card?.isrn, requestRef: data.card?.request },
        code: ticketType.code,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
    })
    log.debug({ ticketRequest })
    let card: Card | undefined = undefined
    if (data.card?.new && ticketRequest) {
        const ticket = await actoraApi.getTicket(ticketRequest.externalRef)
        if (ticket)
            card = await cardService.postCard(customer.accountId, {
                externalRef: ticket.fulfilmentRequest.target.reference,
                status: CardStatus.Pending,
            })
    }
    if (data.card?.existing && ticketRequest.card) {
        card = await cardService.postCard(customer.accountId, {
            externalRef: ticketRequest.card.id,
            status: CardStatus.Active,
            issued: ticketRequest.card.cardDates.ISSUED,
            expiry: ticketRequest.card.cardDates.EXPIRY,
        })
    }

    const params = {
        TableName: process.env.TICKETS_TABLE_NAME,
        Item: {
            accountId,
            ticketId: uuid.v4(),
            ticketType,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            cost: ticketType.cost,
            createdAt: moment().format(),
            status: 'Requested',
            externalRef: ticketRequest.externalRef,
            cardId: card?.cardId
        },
    } as PutItemInput

    await dynamoDb.put(params)
    return params.Item
})
