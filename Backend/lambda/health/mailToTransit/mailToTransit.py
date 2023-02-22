import boto3
from botocore.exceptions import ClientError
import json
import os

SENDER = os.environ['SENDER_EMAIL']
GET_USER_FN_ARN = os.environ['GET_USER_FN_ARN']


# def validate_user(access_token):
#     user_validation_client = boto3.client('lambda')
#     input_params = {
#         "access_token": access_token
#     }
#     response = user_validation_client.invoke(
#         FunctionName=GET_USER_FN_ARN,
#         InvocationType='RequestResponse',
#         Payload=json.dumps(input_params)
#     )
#     data = json.load(response['Payload'])
#     if data.get('success'):
#         return data
#     return None


def lambda_handler(event, context):
    recipient = event['recipient']
    t_provider = event['t_provider']
    name = event['patient_name']
    action = event['action']
    appointment_date = event['initial_date']
    healthcare_name = event['healthcare_name']

    # healthcare_number = event['healthcare_number']
    # access_token = event['access_token']

    subject = "Attention: Changes in appointment for {}".format(name)

    if "cancel" == action:
        message = '''
        Hello {},
        The appointment for {} on {} has been cancelled. If more information is needed, please contact {}.
        Thank you.
        '''.format(t_provider, name, appointment_date, healthcare_name)
    elif "update" == action:
        new_date = event['new_date']
        appointment_type = event['type']
        message = '''
        Hello {},
        The appointment for {} on {} has been changed to {} and will be {}. If the new appointment doesn't align with your schedule, please contact {}.
        Thank you.
        '''.format(t_provider, name, appointment_date, new_date,appointment_type,healthcare_name)
    else:
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": "INVALID"
        }
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
