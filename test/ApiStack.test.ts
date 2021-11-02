import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../stacks/ApiStack";

describe("Api Stack", () => {
  let stack: ApiStack
  let table: sst.Table

  beforeEach(() => {
    const app = new sst.App();
    const parentStack = new sst.Stack(app, "dummy")
    table = new sst.Table(parentStack, "test", {
      fields: {
        noteId: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "noteId" }
    })

    stack = new ApiStack(app, "test-api", table);
  })

  it('has a Lambda function', () => expect(stack).to(haveResource("AWS::Lambda::Function")))

  // it('sets the DynamoDB table name in the env vars', () => {
  //   expect(stack).to(haveResource("AWS::Lambda::Function", { Properties: {
  //     Environment: {
  //       Variables: {
  //         TABLE_NAME: table.tableName
  //       }
  //     }
  //   }}))
  // })

  describe('routes', () => {
    const cases = [{
      route: '/tickets', method: 'GET'
    }, {
      route: '/tickets', method: 'POST'
    }, {
      route: '/tickets/{id}', method: 'GET'
    }, {
      route: '/tickets/{id}', method: 'PUT'
    }, {
      route: '/tickets/{id}', method: 'DELETE'
    }]
    cases.forEach(function({route, method}) {
      it(`has ${method} route to ${route}`, () => {
        expect(stack).to(haveResource("AWS::ApiGatewayV2::Route", {
          RouteKey: `${method} ${route}`,
        }))
      })
    })
  })
})
