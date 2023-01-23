import os
import boto3
import json

s3 = boto3.client('s3')


def lambda_handler(event, context):
    bucket = "infrastructurestack-magpotlucktransport7850d2a2-1pbwtata4373z"
    key = "index.html"
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        return response['Body'].read()
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
