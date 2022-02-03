import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
      
        // Creates a CodeCommit repository called 'WorkshopRepo'
        new codecommit.Repository(this, 'TestRepo', {
            repositoryName: "TestRepo"
        });
        // Pipeline code goes here
    }
}
