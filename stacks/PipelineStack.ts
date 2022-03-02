import * as sst from "@serverless-stack/resources"
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

export default class PipelineStack extends sst.Stack {
    constructor(scope: sst.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'demo-repo', {
            repositoryName: "demo-repo"
        });

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
       const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'DemoPipeline',
            synth: new CodeBuildStep('SynthStep', {
                    input: CodePipelineSource.codeCommit(repo, 'master'),
                    installCommands: [
                        'npm install -g aws-cdk',
                        'apt-get install -y git',
                        'yarn --version || npm -g install yarn'
                    ],
                    commands: [
                        'npm ci',
                        'npm run build',
                        'npx cdk synth'
                    ]
                }
            )
        });
    }
}
