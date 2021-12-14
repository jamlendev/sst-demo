import { APIGatewayProxyEventV2 } from "aws-lambda"
import * as uuid from "uuid"
import { PutItemInput } from "aws-sdk/clients/dynamodb"
import { cognitoUtils, dynamoDb, handler } from "../util"
import { customerProfileService, cardService } from '../services'
import { TicketInput, ticketTypes } from './'
import moment from 'moment'
import { ActoraApiClient } from "../clients/actoraApiClient"
import { CardStatus } from "../services/cardService"

export const main = handler(async (event: any, data: TicketInput) => {
    const actoraApi = await ActoraApiClient.create()
    data = data || event.arguments.request
    console.debug(data)
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)

    const ticketType = ticketTypes[data.ticketType]
    const startDate = moment(data.startDate)
    const endDate = moment(data.startDate).add({ days: ticketType.expires });

    const customer = await customerProfileService.getCustomer(event.requestContext?.authorizer.iam.cognitoIdentity)
    const ticketRequest = await actoraApi.ticketRequest({
        customerRef: customer.externalRef,
        card: data.card,
        code: ticketType.code,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
    })
    console.debug({ ticketRequest })
    if (data.card?.new && ticketRequest) {
        const ticket = await actoraApi.getTicket(ticketRequest.externalRef)
        if (ticket)
            await cardService.postCard({
                accountId: customer.accountId,
                externalRef: ticket.fulfilmentRequest.target.reference,
                status: CardStatus.Pending,
                cardId: ticket.fulfilmentRequest.target.reference,
            })
    }
    if (data.card?.existing && ticketRequest.card) {
        await cardService.postCard({
            accountId: customer.accountId,
            externalRef: ticketRequest.card.id,
            status: CardStatus.Active,
            issued: ticketRequest.card.cardDates.ISSUED,
            expiry: ticketRequest.card.cardDates.EXPIRY,
            cardId: ticketRequest.card.cardNumber.ISRN,
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
            createdAt: Date.now(),
            status: 'Requested',
            externalRef: ticketRequest.externalRef,
        },
    } as PutItemInput

    await dynamoDb.put(params)
    return params.Item
})
