import { dynamoDb } from "../util"
import { PutItemInput } from "aws-sdk/clients/dynamodb"
import moment from 'moment'
import * as uuid from "uuid"

export default {
  postCard: async (accountId: string, card: CardInput): Promise<Card> => {
        const params = {
            TableName: process.env.CARDS_TABLE_NAME,
            Item: {
              accountId,
              cardId: uuid.v4(),
              ...card,
              createdAt: moment().format(),
            }
        } as PutItemInput
        const result = await dynamoDb.put(params)

        return result.Attributes as Card
    }
}


export interface CardInput {
  status: CardStatus
  issued?: string
  expiry?: string
  externalRef: string
}
export interface Card extends CardInput {
    accountId: string
    cardId: string
}

export enum CardStatus {
    Active = 'ACTIVE',
    Pending = 'PENDING',
}
