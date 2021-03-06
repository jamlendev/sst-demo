import "reflect-metadata"
import * as sst from "@serverless-stack/resources";

import EventingStack from './EventingStack'
import StorageStack from "./StorageStack"
import ApiStack from "./ApiStack"
import AuthStack from "./AuthStack"
import FrontendStack from "./FrontendStack"
// import ApolloApiStack from "./ApolloApiStack";
// import AppSyncStack from "./AppSyncStack";
import CustomerProfileStorageStack from "./CustomerProfileStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });
  const eventBusStack = new EventingStack(app, "eventing")
  const storageStack = new StorageStack(app, "storage")
  const customerProfileStorageStack = new CustomerProfileStorageStack(app, "customerProfile")
  const apiStack = new ApiStack(app, "api", { tables: { ...storageStack.tables, customers: customerProfileStorageStack.customers }, bus: eventBusStack.bus })
  // const apolloStack = new ApolloApiStack(app, "graphql", storageStack.tickets)
  const authStack = new AuthStack(app, "auth", { api: apiStack.api, customerProfile: customerProfileStorageStack.customers, bus: eventBusStack.bus })
  // new AppSyncStack(app, "graphql", storageStack.tickets, authStack.auth)
  new FrontendStack(app, "frontend",
                    apiStack.api,
                    // apolloStack.api,
                    authStack.auth,
    // bucket: storageStack.bucket,
  )
}
