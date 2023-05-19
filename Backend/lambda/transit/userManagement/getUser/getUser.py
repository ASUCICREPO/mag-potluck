import boto3

def error_message(msg):
    return {'message': msg, "error": True, "success": False, "data": None}


def dataListToDictionay(datalist):
    data_dictionary = {}
    for item in datalist:
        data_dictionary[item['Name']] = item['Value']
    return data_dictionary


def lambda_handler(event, context):
    for field in ["access_token"]:
        if event.get(field) is None:
            return error_message(f"Please provide {field} to renew tokens")
    client = boto3.client('cognito-idp')
    try:
        response = client.get_user(AccessToken=event["access_token"])

    except client.exceptions.UnauthorizedException as e:
        return error_message("Unauthorized ")
    except Exception as e:
        return {
            "error": True,
            "success": False,
            "data": None,
            'message': str(e),
        }
    return {
        "error": False,
        "success": True,
        "data": dataListToDictionay(response["UserAttributes"]),
        'message': None,
    }
