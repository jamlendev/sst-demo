import * as sst from "@serverless-stack/resources"

export default class EventingStack extends sst.Stack {
  public bus: sst.EventBus
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    // Create the API
    this.bus = new sst.EventBus(this, 'tfgm.ticketing')
  }
}
