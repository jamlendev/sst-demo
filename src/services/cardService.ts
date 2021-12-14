import { dynamoDb } from "../util"
import { PutItemInput } from "aws-sdk/clients/dynamodb";

export default {
    postCard: async (card: Card): Promise<Card> => {
        const params = {
            TableName: process.env.CARDS_TABLE_NAME,
            Item: {
                ...card
            }
        } as PutItemInput
        const result = await dynamoDb.put(params)

        return result.Attributes as Card
    }
}

export interface Card {
    accountId: string
    cardId: string
    status: CardStatus
    issued?: string
    expiry?: string
    externalRef: string
}

export enum CardStatus {
    Active = 'ACTIVE',
    Pending = 'PENDING',
}
