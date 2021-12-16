import * as sst from "@serverless-stack/resources"

export interface ApiStackProps extends sst.StackProps {
  tables: Record<string, sst.Table>
}

export default class ApiStack extends sst.Stack {
  public api: sst.Api

  constructor(scope: sst.App, id: string, props: ApiStackProps) {
    super(scope, id, props)

    // Create the API
    this.api = new sst.Api(this, "Api", {
      defaultAuthorizationType: sst.ApiAuthorizationType.AWS_IAM,
      defaultFunctionProps: {
        environment: {
          TICKETS_TABLE_NAME: props.tables.tickets.tableName,
          CARDS_TABLE_NAME: props.tables.cards.tableName,
          CUSTOMERS_TABLE_NAME: props.tables.customers.tableName,
          ACT_ENDPOINT: process.env.ACT_ENDPOINT || "",
          ACT_AUTH_ENDPOINT: process.env.ACT_AUTH_ENDPOINT || '',
          ACT_CLIENT_ID: process.env.ACT_CLIENT_ID || '',
          ACT_CLIENT_SECRET: process.env.ACT_CLIENT_SECRET || '',
        },
      },
      cors: true,
      routes: {
        "POST   /tickets": "src/tickets/purchase.main",
        "GET    /tickets": "src/tickets/my-tickets.main",
        "GET    /tickets/{id}/state": "src/tickets/get.state",
        "GET    /tickets/{id}": "src/tickets/get.main",
        "PUT    /tickets/{id}": "src/tickets/update.main",
        "DELETE /tickets/{id}": "src/tickets/delete.main",
        "GET    /ticket-types": "src/tickets/types.main",

        "GET    /cards": "src/cards/my-cards.temp",
        "POST   /cards": "src/cards/my-cards.request",
      },
    })

    // Allow the API to access the table
    this.api.attachPermissions(Object.values(props.tables))
    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: this.api.url,
    })
  }
}
