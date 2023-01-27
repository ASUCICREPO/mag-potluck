import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import {OAuthScope, UserPoolClientIdentityProvider} from "aws-cdk-lib/aws-cognito";
import {CfnOutput, CfnOutputProps} from "aws-cdk-lib";
import * as fs from 'fs'

import * as yaml from 'yaml'
import LambdaWithApi from '../ASU_CIC_CDK/LambdaWithApi'
import StaticSiteWithCdn from "../ASU_CIC_CDK/StaticSiteWithCdn";

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const config = yaml.parse(fs.readFileSync('configuration.yaml', 'utf8'))

        const websitedeployer = new StaticSiteWithCdn(this, config.ID + 'web')
        websitedeployer.deploy("web/build")

        const table = new dynamodb.Table(this, 'Table', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
        });

        const userPool = new cognito.UserPool(this, config.userPoolName, {
            userPoolName: config.userPoolName,
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            passwordPolicy: {
                minLength: 6,
                requireLowercase: true,
                requireDigits: true,
                requireUppercase: false,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            standardAttributes: {
                fullname: {
                    required: true,
                    mutable: false
                },
                phoneNumber: {
                    required: true,
                    mutable: false
                }
            }
        });

        const userPoolClient = userPool.addClient('MagClient', {
            userPoolClientName: "testMagClient",
            oAuth: {
                flows: {authorizationCodeGrant: true},
                scopes: [OAuthScope.OPENID, OAuthScope.custom('email'), OAuthScope.custom('phone')],
                callbackUrls: ["https://" + websitedeployer.getCdn().domainName]
            },
            supportedIdentityProviders: [
                UserPoolClientIdentityProvider.COGNITO,
            ],
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }
        })

        const lambdaDeployer = new LambdaWithApi(this, config.ID, null)
        lambdaDeployer.deploy('getuser', 'lambda/transit/userManagement/getUser/getUser', null, null, null)
        lambdaDeployer.deploy('registerpatient', 'lambda/transit/registerPatient/registerPatient', 'transit/registerpatient', 'POST', {
            DYNAMODB_TABLE: table.tableName,
            BASE_URL: "https://" + websitedeployer.getCdn().domainName + "/PatientDetails/",
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn
        })
        lambdaDeployer.deploy('signuptransit', 'lambda/transit/userManagement/signupUser/signupUser', 'transit/account/signupuser', 'POST', {
            USER_POOL_ID: userPool.userPoolId,
            CLIENT_ID: userPoolClient.userPoolClientId
        })
        lambdaDeployer.deploy('signuptransitconfirm', 'lambda/transit/userManagement/confirmEmail/confirmEmail', 'transit/account/confirmemail', 'POST', {
            USER_POOL_ID: userPool.userPoolId,
            CLIENT_ID: userPoolClient.userPoolClientId
        })
        lambdaDeployer.deploy('transitlogin', 'lambda/transit/userManagement/loginUser/loginUser', 'transit/account/login', 'POST', {
            USER_POOL_ID: userPool.userPoolId,
            CLIENT_ID: userPoolClient.userPoolClientId,
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn
        })
        lambdaDeployer.deploy('transitlogout', 'lambda/transit/userManagement/logoutUser/logoutUser', 'transit/account/logout', 'POST', {
            USER_POOL_ID: userPool.userPoolId,
            CLIENT_ID: userPoolClient.userPoolClientId
        })
        lambdaDeployer.deploy('transitemail', 'lambda/transit/mailToHealth/mailToHealth', 'transit/sendmail', 'POST', {
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn,
            SENDER_EMAIL: config.Email
        })
        lambdaDeployer.deploy('healthemail', 'lambda/health/mailToTransit/mailToTransit', 'health/sendmail', 'POST', {
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn,
            SENDER_EMAIL: config.Email
        })
        lambdaDeployer.deploy('getpatientdetails', 'lambda/health/getPatientDetails/getPatientDetails', 'health/getpatientdetails', 'POST', {
            DYNAMODB_TABLE: table.tableName
        })
        lambdaDeployer.deploy('updatepatient', 'lambda/health/updatePatientAppointment/updatePatientAppointment', 'health/updatepatient', 'POST', {
            DYNAMODB_TABLE: table.tableName
        })


        lambdaDeployer.getLambdaDeployment('transitlogin').addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'cognito-idp:AdminInitiateAuth'
                ],
                resources: ['*']
            })
        )

        const emailPolicies = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'ses:SendEmail',
                'ses:SendRawEmail',
                'ses:SendTemplatedEmail',
            ],
            resources: ['*'],
        })

        const lambdaCallGetUserPolicy = new iam.PolicyStatement({
            sid: "lambdaCallGetUserLambda",
            effect: iam.Effect.ALLOW,
            actions: [
                'lambda:InvokeFunction',
                'lambda:InvokeAsync'
            ],
            resources: [lambdaDeployer.getLambdaDeployment('getuser').functionArn]
        })

        lambdaDeployer.getLambdaDeployment('transitemail').addToRolePolicy(emailPolicies)
        lambdaDeployer.getLambdaDeployment('healthemail').addToRolePolicy(emailPolicies)
        lambdaDeployer.getLambdaDeployment('transitemail').addToRolePolicy(lambdaCallGetUserPolicy)
        lambdaDeployer.getLambdaDeployment('healthemail').addToRolePolicy(lambdaCallGetUserPolicy)
        lambdaDeployer.getLambdaDeployment('registerpatient').addToRolePolicy(lambdaCallGetUserPolicy)
        lambdaDeployer.getLambdaDeployment('transitlogin').addToRolePolicy(lambdaCallGetUserPolicy)

        table.grantReadWriteData(lambdaDeployer.getLambdaDeployment('registerpatient'));
        table.grantReadData(lambdaDeployer.getLambdaDeployment('getpatientdetails'));
        table.grantReadWriteData(lambdaDeployer.getLambdaDeployment('updatepatient'))

        new CfnOutput(this, 'API_URL', <CfnOutputProps>{value: lambdaDeployer.getRootApi()?.url});
        new CfnOutput(this, 'WEBSITE_URL', <CfnOutputProps>{value: websitedeployer.getCdn().domainName});
    }
}