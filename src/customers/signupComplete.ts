import { UpdateItemInput } from "aws-sdk/clients/dynamodb"
import dynamoDb from "../util/dynamodb"
import { ActoraApiClient } from '../clients/actoraApiClient'
import { EventBridge } from "aws-sdk"
import { Logger, TLogLevelName } from "tslog"

const eventBridge = new EventBridge()
const actoraApi = ActoraApiClient.create()
const log = new Logger({ name: 'signupCompleteHandler', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug' })

export async function handler(event: any) {
    log.info('User Signup Complete event handler', JSON.stringify(event))
    const api = await actoraApi
    const { externalRef } = await api.customerRegister({
        forename: event.detail.firstName,
        surname: event.detail.lastName,
    })
    const params = {
        TableName: process.env.CUSTOMERS_TABLE_NAME,
        Key: {
            accountId: event.detail.accountId,
        },
        UpdateExpression: 'SET externalRef = :externalRef',
        ExpressionAttributeValues: {
            ':externalRef': externalRef
        },
        ReturnValues: 'ALL_NEW'
    } as UpdateItemInput

    const result = await dynamoDb.update(params)
  log.debug(JSON.stringify(result))
    eventBridge.putEvents({
        Entries: [{
            EventBusName: process.env.BUS_NAME,
            Source: 'tfgm.ticketing',
            DetailType: 'ActoraCustomerCreated',
            Detail: JSON.stringify({
                accountId: event.detail.accountId,
                externalRef,
            })
        }]
    })
        .promise()
        .catch(console.error)
}
