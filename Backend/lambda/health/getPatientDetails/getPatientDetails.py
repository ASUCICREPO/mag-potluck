import boto3
import os
import json
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)


def lambda_handler(event, context):
    table = os.environ['DYNAMODB_TABLE']
    id = event['id']

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table)
    response = table.get_item(
        Key={
            'id': id
        }
    )
    print(response)
    try:
        user_data = response['Item']
    except KeyError:
        user_data = None

    if user_data:
        data = response['Item']
        existing_patient = True

    else:
        existing_patient = False
        data = {
            'error': "not found"
        }

    if existing_patient:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps(data, cls=DecimalEncoder)
        }
    else:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps(data, cls=DecimalEncoder)
        }
