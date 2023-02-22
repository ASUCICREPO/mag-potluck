import boto3
import os

USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['CLIENT_ID']


def lambda_handler(event, context):
    access_token = event['access_token']
    client = boto3.client('cognito-idp')
    response = client.revoke_token(Token=access_token, ClientId=CLIENT_ID)
    return response
