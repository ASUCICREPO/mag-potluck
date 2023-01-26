import boto3
import os
import json
from hashlib import md5

GET_USER_FN_ARN = os.environ['GET_USER_FN_ARN']
TABLE = os.environ['DYNAMODB_TABLE']
CONFIG_TABLE = os.environ['CONFIG_DB']


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
    f_name = event['f_name']
    m_name = event['m_name']
    l_name = event['l_name']
    h_name = event['h_name']
    initial_entry_ts = event['initial_entry_ts']
    access_token = event['access_token']

    user = validate_user(access_token)
    if user:
        transit_provider_name = user['data']['name']
        transit_provider_email = user['data']['email']
        transit_provider_phone = user['data']['phone_number']
        dynamodb = boto3.resource('dynamodb')

        config_db = dynamodb.Table(CONFIG_TABLE)
        response = config_db.get_item(
            Key={
                'key': 'base_url'
            }
        )
        base_url = response['Item']['value']

        table = dynamodb.Table(TABLE)

        id = md5(str(f_name + m_name + l_name).encode()).hexdigest()
        response = table.get_item(
            Key={
                'id': id
            }
        )
        try:
            user_data = response['Item']
        except KeyError:
            user_data = None

        if user_data:
            patient_data = response['Item']
            existing_patient = True
            data = {
                'newPatient': 'False',
                'link': patient_data['link']
            }
        else:
            existing_patient = False
            link = base_url + id
            response = table.put_item(
                Item={
                    'id': id,
                    'firstname': f_name,
                    'lastname': l_name,
                    'middelname': m_name,
                    'link': link,
                    'transitprovidername': transit_provider_name,
                    'transitprovideremail': transit_provider_email,
                    'transitproviderphone': transit_provider_phone,
                    'healthcareprovidername': h_name,
                    'initialentrytimestamp': initial_entry_ts
                })
            data = {
                'newPatient': 'True',
                'link': link
            }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps(data)
        }

    else:
        return {
            "statusCode": 401,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": "UNAUTHORIZED"
        }
