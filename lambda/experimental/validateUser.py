import os
import boto3
import json

GET_USER_FN_ARN = os.environ['GET_USER_FN_ARN']


def validate_user(access_token):
    user_validation_client = boto3.client('lambda')
    input_params = {
        "access_token": access_token
    }
    response = user_validation_client.invoke(
        FunctionName=GET_USER_FN_ARN,
        InvocationType='RequestResponse',
        Payload=json.dumps(input_params)
    )
    data = json.load(response['Payload'])
    if data.get('success'):
        return data
    return None


def lambda_handler(event, context):
    res = validate_user(event['access_token'])

    return res
