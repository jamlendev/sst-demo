import * as sst from "@serverless-stack/resources"

export default class StorageStack extends sst.Stack {
  public tables: Record<string, sst.Table> = {}

  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    // Create the DynamoDB table
    this.tables.tickets = new sst.Table(this, "Tickets", {
      fields: {
        accountId: sst.TableFieldType.STRING,
        ticketId: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "accountId", sortKey: "ticketId" },
    })

    this.tables.cards = new sst.Table(this, "Cards", {
      fields: {
        accountId: sst.TableFieldType.STRING,
        cardId: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "accountId", sortKey: "cardId" },
    })

    // this.tables.externalMessageAudit = new sst.Table(this, "ExternalMessageAudit", {
    //   fields: {
    //     accountId: sst.TableFieldType.STRING,
    //     cardId: sst.TableFieldType.STRING,
    //   },
    //   primaryIndex: { partitionKey: "accountId", sortKey: "cardId" },
    // })
  }
}
