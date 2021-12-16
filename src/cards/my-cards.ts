import { cognitoUtils, dynamoDb, handler } from "../util"
import { ActoraApiClient } from '../clients/actoraApiClient'
import { GetItemInput, QueryInput } from "aws-sdk/clients/dynamodb"
import { customerProfileService, cardService } from '../services'
import { CardStatus } from "../services/cardService"
import { Logger, TLogLevelName } from 'tslog'

const log: Logger = new Logger({minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug'})
export const func = async (event: any): Promise<any> => {
    const actoraApi = await ActoraApiClient.create()
    /*
      Get externalRef from dynamoDb Customers using accountId
      send get request to actora with
      */
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
    const params = {
        TableName: process.env.CUSTOMERS_TABLE_NAME,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        Key: {
            accountId,
        },
    } as GetItemInput

    const customer = await dynamoDb.get(params)
    console.debug(accountId, customer)
    const externalRef = customer?.Item?.externalRef
    const result = await actoraApi.getCards(externalRef)
    return result
}

export const temp = handler(fetch)

async function fetch(event: any): Promise<any> {
    const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)

    const params = {
        TableName: process.env.CARDS_TABLE_NAME,
        KeyConditionExpression: "accountId = :accountId",
        ExpressionAttributeValues: { ":accountId": accountId },
    } as QueryInput

    log.debug(params)
    const result = await dynamoDb.query(params)
    // Return the retrieved item

    log.debug(result.Items)
    // console.debug(result.Items)
    return result.Items
}

export const request = handler(async (event: any): Promise<void> => {
    const customer = await customerProfileService.getCustomer(event.requestContext?.authorizer.iam.cognitoIdentity)
    const actoraApi = await ActoraApiClient.create()

    log.debug('Requesting card from Actora', { customer })
    const result = await actoraApi.cardRequest({
        customerRef: customer.externalRef
    })

    log.debug('Saving card to Dynamo', { externalRef: result.externalRef })
    await cardService.postCard({
        accountId: customer.accountId,
        externalRef: result.externalRef,
        status: CardStatus.Pending,
        cardId: result.externalRef,
    })
})
