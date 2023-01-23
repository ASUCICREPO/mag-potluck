import boto3
from botocore.exceptions import ClientError
import json
import os

SENDER = "aakash.mathai@asu.edu"
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
    recipient = event['recipient']
    link = event['link']
    name = event['patient_name']
    access_token = event['access_token']

    user = validate_user(access_token)
    if user:
        subject = "Please Confirm : Appointment for {}".format(name)
        message = '''Hello {},
Please confirm the appointment for {} by clicking on this link:
{}
Regards,
{}'''.format(str(recipient).split('@')[0], name, link, user['data']['name'])
        client = boto3.client('ses')
        try:
            response = client.send_email(
                Destination={
                    'ToAddresses': [
                        recipient,
                    ],
                },
                Message={
                    'Body': {
                        "Text": {"Data": message},
                    },
                    'Subject': {
                        'Charset': "UTF-8",
                        'Data': subject,
                    },
                },
                Source=SENDER
            )

        except ClientError as e:
            print(e.response['Error']['Message'])
            response = {'error': e.response}

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(response)
        }
    else:
        return {
            "statusCode": 401,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": "UNAUTHORIZED"
        }
