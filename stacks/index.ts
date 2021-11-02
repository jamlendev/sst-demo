import "reflect-metadata"
import StorageStack from "./StorageStack"
import ApiStack from "./ApiStack"
import AuthStack from "./AuthStack"
import FrontendStack from "./FrontendStack"
import * as sst from "@serverless-stack/resources";
// import ApolloApiStack from "./ApolloApiStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  const storageStack = new StorageStack(app, "storage")
  const apiStack = new ApiStack(app, "api", storageStack.tickets)
  // const apolloStack = new ApolloApiStack(app, "graphql")
  const authStack = new AuthStack(app, "auth", apiStack.api)
  new FrontendStack(app, "frontend",
                    apiStack.api,
                    // apolloStack.api,
                    authStack.auth,
    // bucket: storageStack.bucket,
  )
}
