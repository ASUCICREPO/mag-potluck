import boto3
import os
import json


def lambda_handler(event, context):
    table = os.environ['DYNAMODB_TABLE']
    appointment_status = event['appointment_status']
    scheduled_ts = event['scheduled_ts']
    last_updated_ts = event['update_ts']
    id = event['id']

    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table(table)

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
        response = table.update_item(
            Key={
                'id': id
            },
            ConditionExpression='attribute_exists(id)',
            UpdateExpression='SET appointment_status = :val1, scheduled_ts = :val2, last_updated_ts = :val3',
            ExpressionAttributeValues={
                ':val1': appointment_status,
                ':val2': scheduled_ts,
                ':val3': last_updated_ts
            }
        )
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps(response)
        }
    else:
        data = {
            'error': "not found"
        }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps(data)
        }
