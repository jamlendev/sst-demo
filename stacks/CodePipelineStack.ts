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
        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
         const pipeline = new CodePipeline(this, 'Pipeline', {
              pipelineName: 'CDKPipeline',
              synth: new CodeBuildStep('SynthStep', {
                      input: CodePipelineSource.codeCommit(repo, 'master'),
                      installCommands: [
                          'yarn install -g aws-cdk'
                      ],
                      commands: [
                          'echo Build ID is $CODEBUILD_BUILD_ID'
                      ]
                  }
              )
          });
    }
}
