import { cognitoUtils, dynamoDb, handler } from "../util"
import { ActoraApiClient, ActoraClient } from '../clients/actoraApiClient'
import { GetItemInput } from "aws-sdk/clients/dynamodb"

let actoraApi: ActoraClient
ActoraApiClient.create().then((c) => actoraApi = c)

export const func = async (event: any): Promise<any> => {
  /*
    Get externalRef from dynamoDb Customers using accountId
    send get request to actora with
    */
  console.log(event.requestContext?.authorizer.iam.cognitoIdentity, event.identity?.claims)
  const accountId = cognitoUtils.getAccountId(event.requestContext?.authorizer.iam.cognitoIdentity)
  const params = {
    TableName: process.env.CUSTOMERS_TABLE_NAME,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    Key: {
      accountId,
    },
  } as GetItemInput

  console.log(accountId, params)
  const customer = await dynamoDb.get(params)
  console.log(customer)
  const externalRef = customer?.Item?.externalRef
  const result = await actoraApi.getCards(externalRef)
  return result
  // return Promise.resolve([{
  //   name: 'test card',
  //   id: 'fdbeb959-1fc9-410d-b034-55c8b6389638',
  //   status: 'active',
  //   dates: {
  //     issued: '2021-11-24T14:23:23Z',
  //     expires: '2024-10-30T00:00:00Z'
  //   },
  //   numbers: {
  //     serial: '1454652474WAL0002230',
  //     isrn: '633597024000118411'
  //   }
  // }])
}

export const main = handler(func)
