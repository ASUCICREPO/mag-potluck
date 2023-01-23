import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {Construct} from "constructs";

export default class LambdaWithApi {
    id: string;
    rootApi: apigw.RestApi | null
    scope: Construct
    enableCors: apigw.CorsOptions = {
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS
    }
    lambdaDeployments = new Map;
    apiDeployments = new Map;
    apiMethodDeployments = new Map;


    constructor(scope: Construct, id: string, rootApi: apigw.RestApi | null = null) {
        this.id = id
        this.rootApi = rootApi
        this.scope = scope
        if (rootApi == null) {
            this.rootApi = new apigw.RestApi(scope, id + '_api', {defaultCorsPreflightOptions: this.enableCors})
        } else {
            this.rootApi = rootApi
        }
    }

    private deployLambda(id: string, assetPath: string, environment: any) {
        return new lambda.Function(this.scope, this.id + id + "_lambda", {
            runtime: lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromAsset(path.dirname(assetPath)),
            handler: assetPath.split('/').pop()! + ".lambda_handler",
            environment: environment
        });
    }

    private deployApiPathResource(path: string) {
        let apiEntity = this.rootApi?.root


        const resources = path.split('/')
        resources.forEach((element) => {
            if (apiEntity?.getResource(element) == null) {
                apiEntity = apiEntity?.addResource(element, {defaultCorsPreflightOptions: this.enableCors})
            } else {
                apiEntity = apiEntity?.getResource(element)
            }
        });
        return apiEntity
    }

    private addApiMethod(resource: apigw.Resource, httpMethod: string, lambdaFunction: lambda.Function) {

        const LambdaIntegrationResponses = {
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': "'*'"
            }
        }

        const LambdaMethodResponses = {
            statusCode: '200',
            responseParameters: {
                'method.response.header.Content-Type': true,
                'method.response.header.Access-Control-Allow-Origin': true
            },
            responseModels: {'application/json': apigw.Model.EMPTY_MODEL}
        }

        return resource.addMethod(httpMethod, new apigw.LambdaIntegration(lambdaFunction, {
            proxy: false,
            integrationResponses: [LambdaIntegrationResponses]
        }), {
            methodResponses: [LambdaMethodResponses]
        })
    }

    deploy(id: string, assetPath: string, apiPath: string | null, httpMethod: string | null, LambdaEnvVars: any) {
        const lambda = this.deployLambda(id, assetPath, LambdaEnvVars)
        this.lambdaDeployments.set(id, lambda)
        if (apiPath != null && httpMethod != null) {
            const api = this.deployApiPathResource(apiPath)
            const apiMethod = this.addApiMethod(<apigw.Resource>api, httpMethod.toUpperCase(), lambda)
            this.apiDeployments.set(id, api)
            this.apiMethodDeployments.set(id, apiMethod)
        } else {
            this.apiDeployments.set(id, null)
            this.apiMethodDeployments.set(id, null)
        }

    }

    getRootApi() {
        return this.rootApi
    }

    getLambdaDeployment(id: string) {
        return this.lambdaDeployments.get(id)
    }

    getApiDeployment(id: string) {
        return this.apiDeployments.get(id)
    }

    getApiMethodDeployment(id: string) {
        return this.apiMethodDeployments.get(id)
    }
}