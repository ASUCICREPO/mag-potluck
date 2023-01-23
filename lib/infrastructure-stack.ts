import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as cr from 'aws-cdk-lib/custom-resources'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import {renderFile} from 'template-file';
import {writeFileSync} from 'fs';
import {OAuthScope, UserPoolClientIdentityProvider} from "aws-cdk-lib/aws-cognito";

import LambdaWithApi from '../ASU_CIC_CDK/LambdaWithApi'
import StaticSiteWithCdn from "../ASU_CIC_CDK/StaticSiteWithCdn";

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const healthSiteDeployer = new StaticSiteWithCdn(this, 'magpotluckhealth')
        healthSiteDeployer.deploy("web/health")

        const transitSiteDeployer = new StaticSiteWithCdn(this, 'magpotlucktransit')
        transitSiteDeployer.deploy("web/transit")

        const table = new dynamodb.Table(this, 'Table', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
        });

        const config_db = new dynamodb.Table(this, 'ConfigTable', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {name: 'key', type: dynamodb.AttributeType.STRING},
        });

        const userPool = new cognito.UserPool(this, 'transitUserpool', {
            userPoolName: 'transitUserpool',
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
                fullname:{
                    required:true,
                    mutable: false
                },
                phoneNumber:{
                    required:true,
                    mutable: false
                }
            }
        });

        const userPoolClient = userPool.addClient('MagClient', {
            userPoolClientName: 'testMagClient',
            oAuth: {
                flows: {authorizationCodeGrant: true},
                scopes: [OAuthScope.OPENID, OAuthScope.custom('email'), OAuthScope.custom('phone')],
                callbackUrls: ["https://" + transitSiteDeployer.getCdn().domainName]
            },
            supportedIdentityProviders: [
                UserPoolClientIdentityProvider.COGNITO,
            ],
            authFlows:{
                adminUserPassword:true,
                custom:true,
                userPassword:true
            }
        })

        const lambdaDeployer = new LambdaWithApi(this, 'magpotluck', null)
        lambdaDeployer.deploy('getuser', 'lambda/transit/userManagement/getUser/getUser', null, null, null)
        lambdaDeployer.deploy('registerpatient', 'lambda/transit/registerPatient/registerPatient', 'transit/registerpatient', 'POST', {
            DYNAMODB_TABLE: table.tableName,
            CONFIG_DB: config_db.tableName,
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
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn
        })
        lambdaDeployer.deploy('healthemail', 'lambda/health/mailToTransit/mailToTransit', 'health/sendmail', 'POST', {
            GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn
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
        config_db.grantReadData(lambdaDeployer.getLambdaDeployment('registerpatient'));
        table.grantReadData(lambdaDeployer.getLambdaDeployment('getpatientdetails'));
        table.grantReadWriteData(lambdaDeployer.getLambdaDeployment('updatepatient'))

        const rootApi = lambdaDeployer.getRootApi()

        if (rootApi != null) {
            const enableCors: apigw.CorsOptions = {
                allowHeaders: apigw.Cors.DEFAULT_HEADERS,
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS
            }
            const webpageApi = rootApi.root.addResource('{pid}', {defaultCorsPreflightOptions: enableCors})
            const pid_template = {
                "id": "$input.params('id')"
            }
            webpageApi.addMethod('GET', new apigw.HttpIntegration(healthSiteDeployer.getBucket().bucketWebsiteUrl, {
                proxy: false,
                options: {
                    requestParameters: {
                        "integration.request.path.pid": "method.request.path.pid"
                    },
                    requestTemplates: {
                        "application/json": JSON.stringify(pid_template)
                    },
                    integrationResponses: [{
                        statusCode: '200',
                        responseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': "'*'"
                        }
                    }]
                }
            }), {
                requestParameters: {
                    "method.request.path.pid": true
                },
                methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Content-Type': true,
                        'method.response.header.Access-Control-Allow-Origin': true
                    },
                    responseModels: {'text/html': apigw.Model.EMPTY_MODEL}
                }]
            })
        }
        new cr.AwsCustomResource(this, 'initTable', {
            onCreate: {
                service: 'DynamoDB',
                action: 'putItem',
                parameters: {
                    TableName: config_db.tableName,
                    Item: {
                        key:
                            {
                                S: "base_url"
                            },
                        value:
                            {
                                S: rootApi?.url
                            }
                    }
                },
                physicalResourceId: cr.PhysicalResourceId.of(config_db.tableName + '_initialization')
            },
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE}),
        });
        // const bucketProperties = {
        //     publicReadAccess: true,
        //     removalPolicy: cdk.RemovalPolicy.DESTROY,
        //     websiteIndexDocument: "index.html",
        //     autoDeleteObjects: true
        // }
        //
        // const hospitalBucket = new s3.Bucket(this, HOSPITAL_WEBSITE_BUCKET, bucketProperties);
        //
        // const transportBucket = new s3.Bucket(this, TRANSPORT_WEBSITE_BUCKET, {
        //     publicReadAccess: true,
        //     removalPolicy: cdk.RemovalPolicy.DESTROY,
        //     websiteIndexDocument: "index.html",
        //     autoDeleteObjects: true
        // });
        //
        // const transportWebDeployment = new s3Deployment.BucketDeployment(this, "deployTransportWebsite", {
        //     sources: [s3Deployment.Source.asset("../website_resources_transport")],
        //     destinationBucket: transportBucket,
        //     retainOnDelete: false
        // });
        //
        // const hospitalWebDeployment = new s3Deployment.BucketDeployment(this, "deployHospitalWebsite", {
        //     sources: [s3Deployment.Source.asset("../website_resources_hospital")],
        //     destinationBucket: hospitalBucket,
        //     retainOnDelete: false
        // });
        //
        // const transit_cf = new cloudfront.Distribution(this, "transitSite", {
        //     defaultBehavior: {origin: new origins.S3Origin(transportBucket)}
        // });

        // const transportGetUserLambda = new lambda.Function(this, 'transportGetUser', {
        //     runtime: lambda.Runtime.PYTHON_3_9,
        //     code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //     handler: 'getUser.lambda_handler'
        // });
        // const patientInputLambda = new lambda.Function(this, 'transitLambda', {
        //     runtime: lambda.Runtime.PYTHON_3_9,
        //     code: lambda.Code.fromAsset('lambda/transit/registerPatient'),
        //     handler: 'registerPatient.lambda_handler',
        //     environment: {
        //         DYNAMODB_TABLE: table.tableName,
        //         CONFIG_DB: config_db.tableName,
        //         GET_USER_FN_ARN: lambdaDeployer.getLambdaDeployment('getuser').functionArn
        //     }
        // });

        //     const hospitalGetLambda = new lambda.Function(this, 'hospitalGet', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/hospital_get'),
        //         handler: 'hospitalGet.lambda_handler',
        //         environment: {
        //             DYNAMODB_TABLE: table.tableName
        //         }
        //     });
        //
        //     const hospitalUpdateLambda = new lambda.Function(this, 'hospitalUpdate', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/hospital_update'),
        //         handler: 'hospitalUpdate.lambda_handler',
        //         environment: {
        //             DYNAMODB_TABLE: table.tableName
        //         }
        //     });
        //
        //     const transportSignupLambda = new lambda.Function(this, 'transportSignup', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'signup.lambda_handler',
        //         environment: {
        //             USER_POOL_ID: userPool.userPoolId,
        //             CLIENT_ID: userPoolClient.userPoolClientId
        //         }
        //     });
        //
        //     const transportSignupConfirmLambda = new lambda.Function(this, 'transportSignupConfirm', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'confirm.lambda_handler',
        //         environment: {
        //             USER_POOL_ID: userPool.userPoolId,
        //             CLIENT_ID: userPoolClient.userPoolClientId
        //         }
        //     });
        //
        //     const transportLoginLambda = new lambda.Function(this, 'transportLogin', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'login.lambda_handler',
        //         environment: {
        //             USER_POOL_ID: userPool.userPoolId,
        //             CLIENT_ID: userPoolClient.userPoolClientId
        //         }
        //     });
        //
        //
        //     const validateUserLambda = new lambda.Function(this, 'validateUser', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'validateUser.lambda_handler',
        //         environment: {
        //             GET_USER_FN_ARN: transportGetUserLambda.functionArn
        //         }
        //     });
        //     const logoutLambda = new lambda.Function(this, 'logoutUser', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'logout.lambda_handler',
        //         environment: {
        //             USER_POOL_ID: userPool.userPoolId,
        //             CLIENT_ID: userPoolClient.userPoolClientId
        //         }
        //     });
        //
        //     const renderPageLambda = new lambda.Function(this, 'renderPage', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/transport_user_management'),
        //         handler: 'renderPage.lambda_handler'
        //     });
        //
        //

        //     const emailLambda = new lambda.Function(this, 'sendemail', {
        //         runtime: lambda.Runtime.PYTHON_3_9,
        //         code: lambda.Code.fromAsset('../lambda/email'),
        //         handler: 'sendEmail.lambda_handler',
        //         environment:{
        //             GET_USER_FN_ARN: transportGetUserLambda.functionArn
        //         }
        //     });
        //

        //     transportLoginLambda.addToRolePolicy(
        //         new iam.PolicyStatement({
        //             effect: iam.Effect.ALLOW,
        //             actions:[
        //                 'cognito-idp:AdminInitiateAuth'
        //             ],
        //             resources:['*']
        //         })
        //     )


        //     emailLambda.addToRolePolicy(
        //         new iam.PolicyStatement({
        //             effect: iam.Effect.ALLOW,
        //             actions: [
        //                 'ses:SendEmail',
        //                 'ses:SendRawEmail',
        //                 'ses:SendTemplatedEmail',
        //             ],
        //             resources: ['*'],
        //         }),
        //     );

        // table.grantReadWriteData(patientInputLambda);
        // config_db.grantReadData(patientInputLambda);
        // table.grantReadData(hospitalGetLambda);
        // table.grantReadWriteData(hospitalUpdateLambda)

        //
        //
        //     const enableCors: apigw.CorsOptions = {
        //         allowHeaders: apigw.Cors.DEFAULT_HEADERS,
        //         allowOrigins: apigw.Cors.ALL_ORIGINS,
        //         allowMethods: apigw.Cors.ALL_METHODS
        //     }
        //
        //     const lambdaCallGetUserPolicy = new iam.PolicyStatement({
        //         sid:"lambdaCallGetUserLambda",
        //         effect: iam.Effect.ALLOW,
        //         actions:[
        //             'lambda:InvokeFunction',
        //             'lambda:InvokeAsync'
        //         ],
        //         resources:[transportGetUserLambda.functionArn]
        //     })
        //     validateUserLambda.addToRolePolicy(lambdaCallGetUserPolicy)
        //     emailLambda.addToRolePolicy(lambdaCallGetUserPolicy)
        //     patientInputLambda.addToRolePolicy(lambdaCallGetUserPolicy)
        //


        //     const api = new apigw.RestApi(this, 'magapi', {defaultCorsPreflightOptions: enableCors})
        //     const patientApi = api.root.addResource('patient', {defaultCorsPreflightOptions: enableCors})
        //     const hospitalApi = api.root.addResource('hospital', {defaultCorsPreflightOptions: enableCors})
        //     const hospitalGetApi = hospitalApi.addResource('getpatient', {defaultCorsPreflightOptions: enableCors})
        //     const hospitalUpdateApi = hospitalApi.addResource('updatepatient', {defaultCorsPreflightOptions: enableCors})
        //     const emailapi = api.root.addResource('email', {defaultCorsPreflightOptions: enableCors})
        //     const webpageApi = api.root.addResource('{pid}', {defaultCorsPreflightOptions: enableCors})
        //
        //
        //     const pid_template = {
        //         "id": "$input.params('id')"
        //     }
        //
        //     webpageApi.addMethod('GET', new apigw.HttpIntegration(healthSiteDeployer.getBucket().bucketWebsiteUrl, {
        //         proxy: false,
        //         options: {
        //             requestParameters: {
        //                 "integration.request.path.pid": "method.request.path.pid"
        //             },
        //             requestTemplates: {
        //                 "application/json": JSON.stringify(pid_template)
        //             },
        //             integrationResponses: [{
        //                 statusCode: '200',
        //                 responseParameters: {
        //                     'method.response.header.Access-Control-Allow-Origin': "'*'"
        //                 }
        //             }]
        //         }
        //     }), {
        //         requestParameters: {
        //             "method.request.path.pid": true
        //         },
        //         methodResponses: [{
        //             statusCode: '200',
        //             responseParameters: {
        //                 'method.response.header.Content-Type': true,
        //                 'method.response.header.Access-Control-Allow-Origin': true
        //             },
        //             responseModels: {'text/html': apigw.Model.EMPTY_MODEL}
        //         }]
        //     })
        //
        //     const LambdaMethodResponses = {
        //         statusCode: '200',
        //         responseParameters: {
        //             'method.response.header.Content-Type': true,
        //             'method.response.header.Access-Control-Allow-Origin': true
        //         },
        //         responseModels: {'application/json': apigw.Model.EMPTY_MODEL}
        //     }
        //
        //     const LambdaIntegrationResponses = {
        //         statusCode: '200',
        //         responseParameters: {
        //             'method.response.header.Access-Control-Allow-Origin': "'*'"
        //         }
        //     }
        //
        //     api.root.addMethod('GET', new apigw.LambdaIntegration(renderPageLambda, {
        //         proxy: false,
        //         integrationResponses: [LambdaIntegrationResponses]
        //     }), {
        //         methodResponses: [{
        //             statusCode: '200',
        //             responseParameters: {
        //                 'method.response.header.Content-Type': true,
        //                 'method.response.header.Access-Control-Allow-Origin': true
        //             },
        //             responseModels: {'text/html': apigw.Model.EMPTY_MODEL}
        //         }]
        //     })
        //
        //
        //     emailapi.addMethod('POST', new apigw.LambdaIntegration(emailLambda, {
        //         proxy: false,
        //         integrationResponses: [LambdaIntegrationResponses]
        //     }), {
        //         methodResponses: [LambdaMethodResponses]
        //     })
        //
        //
        //     patientApi.addMethod('POST', new apigw.LambdaIntegration(patientInputLambda, {
        //         proxy: false,
        //         integrationResponses: [LambdaIntegrationResponses]
        //     }), {
        //         methodResponses: [LambdaMethodResponses]
        //     })
        //
        //     hospitalGetApi.addMethod('POST', new apigw.LambdaIntegration(hospitalGetLambda, {
        //         proxy: false,
        //         integrationResponses: [LambdaIntegrationResponses]
        //     }), {
        //         methodResponses: [LambdaMethodResponses]
        //     })
        //
        //     hospitalUpdateApi.addMethod('POST', new apigw.LambdaIntegration(hospitalUpdateLambda, {
        //         proxy: false,
        //         integrationResponses: [LambdaIntegrationResponses]
        //     }), {
        //         methodResponses: [LambdaMethodResponses]
        //     })
        //
        //
    }


}

function updateTemplateFIle(data: any, filepath: string) {
    const x = renderFile(filepath, data)
    x.then(contents =>
        writeFileSync(filepath, contents, {flag: 'w'})
    )

//     Use the function as follows, template variables in file given as  {{api_address}}
//     const data = {
//         api_address: api.url
//     }
//     updateTemplateFIle(data,'../website_resources_hospital/index.js')

}