// import * as iam from "@aws-cdk/aws-iam"
import * as sst from "@serverless-stack/resources"

export default class AuthStack extends sst.Stack {
  public auth: sst.Auth

  constructor(scope: sst.App, id: string, api: sst.Api, customerProfile: sst.Table, props?: sst.StackProps) {
    super(scope, id, props)

    // Create a Cognito User Pool and Identity Pool
    this.auth = new sst.Auth(this, "Auth", {
      cognito: {
        userPool: {
          // Users can login with their email and password
          signInAliases: { email: true },
        },
        triggers: {
          postConfirmation: {
            handler: "src/triggers/postAuth.main",
            timeout: 10,
            environment: { TABLE_NAME: customerProfile.tableName },
            // permissions: [bucket],
          }
        },
      },
    })

    this.auth.attachPermissionsForTriggers([customerProfile])
    this.auth.attachPermissionsForAuthUsers([
      // Allow access to the API
      api,
    //   // Policy granting access to a specific folder in the bucket
    //   new iam.PolicyStatement({
    //     actions: ["s3:*"],
    //     effect: iam.Effect.ALLOW,
    //     resources: [
    //       bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
    //     ],
    //   }),
    ])

    // Show the auth resources in the output
    this.addOutputs({
      Region: scope.region,
      UserPoolId: this.auth.cognitoUserPool?.userPoolId || '',
      IdentityPoolId: this.auth.cognitoCfnIdentityPool?.ref || '',
      UserPoolClientId: this.auth.cognitoUserPoolClient?.userPoolClientId || '',
    })
  }
}
