import "reflect-metadata"
import * as sst from "@serverless-stack/resources";

import StorageStack from "./StorageStack"
import ApiStack from "./ApiStack"
import AuthStack from "./AuthStack"
import FrontendStack from "./FrontendStack"
import CodePipelineStack from "./CodePipelineStack"
// import ApolloApiStack from "./ApolloApiStack";
// import AppSyncStack from "./AppSyncStack";
import CustomerProfileStorageStack from "./CustomerProfileStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });
  const codePipelineStack = new CodePipelineStack(app, "pipeline")
  const storageStack = new StorageStack(app, "storage")
  const customerProfileStorageStack = new CustomerProfileStorageStack(app, "customerProfile")
  const apiStack = new ApiStack(app, "api", storageStack.tickets)
  // const apolloStack = new ApolloApiStack(app, "graphql", storageStack.tickets)
  const authStack = new AuthStack(app, "auth", apiStack.api, customerProfileStorageStack.customers)
  // new AppSyncStack(app, "graphql", storageStack.tickets, authStack.auth)
  new FrontendStack(app, "frontend",
                    apiStack.api,
                    // apolloStack.api,
                    authStack.auth,
    // bucket: storageStack.bucket,
  )
}
