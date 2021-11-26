import * as sst from "@serverless-stack/resources"

export default class CustomerProfileStorageStack extends sst.Stack {
  public customers: sst.Table

  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    // Create the DynamoDB table
    this.customers = new sst.Table(this, "Customers", {
      fields: {
        accountId: sst.TableFieldType.STRING,
        firstName: sst.TableFieldType.STRING,
        lastName: sst.TableFieldType.STRING,
        externalRef: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "accountId", sortKey: "externalRef" },
    })
  }
}
