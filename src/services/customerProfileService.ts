import { cognitoUtils, dynamoDb } from "../util"
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { Logger, TLogLevelName } from 'tslog'

const log: Logger = new Logger({name: 'customerProfileService', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug'})

export default {
    getCustomer: async (cognitoIdentity: any): Promise<Customer> => {
        const accountId = cognitoUtils.getAccountId(cognitoIdentity)
        const params = {
            TableName: process.env.CUSTOMERS_TABLE_NAME,
            Key: {
                accountId
            }
        } as GetItemInput
        const result = await dynamoDb.get(params)
        if (!result.Item) {
            throw new Error("Item not found.")
        }

      log.debug(result.Item)
        // Return the retrieved item
        return result.Item as Customer
    }
}

export interface Customer {
    accountId: string
    firstName: string
    lastName: string
    externalRef: string
}
