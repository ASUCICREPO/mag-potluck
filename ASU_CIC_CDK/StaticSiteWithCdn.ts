import * as cdk from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment"
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import {Construct} from "constructs";

export default class StaticSiteWithCdn {

    bucketProperties = {
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        websiteIndexDocument: "index.html",
        websiteErrorDocument:"index.html",
        autoDeleteObjects: true
    }
    id: string
    scope: Construct
    bucket: s3.Bucket
    cdn: cloudfront.Distribution
    site: s3Deployment.BucketDeployment

    constructor(scope: Construct, id: string) {
        this.id = id
        this.scope = scope
    }

    private deployS3Bucket() {
        this.bucket = new s3.Bucket(this.scope, this.id + "bucket", this.bucketProperties);
    }

    private deployStaticSite(bucket: s3.Bucket, assetPath: string) {
        this.site = new s3Deployment.BucketDeployment(this.scope, this.id + "website", {
            sources: [s3Deployment.Source.asset(assetPath)],
            destinationBucket: bucket,
            retainOnDelete: false

        });
    }

    private deployCdn() {
        this.cdn = new cloudfront.Distribution(this.scope, this.id + "cdn", {
            defaultBehavior: {origin: new origins.S3Origin(this.bucket)}
        });
    }

    deploy(assetPath: string) {
        this.deployS3Bucket()
        this.deployStaticSite(this.bucket, assetPath)
        this.deployCdn()
    }

    getBucket() {
        return this.bucket
    }

    getCdn() {
        return this.cdn
    }

    getSite() {
        return this.site
    }

}