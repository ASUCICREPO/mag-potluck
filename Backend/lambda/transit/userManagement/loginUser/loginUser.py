import boto3
import os
import json

USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['CLIENT_ID']
GET_USER_FN_ARN = os.environ['GET_USER_FN_ARN']


# def get_secret_hash(username):
#     msg = username + CLIENT_ID
#     dig = hmac.new(str(CLIENT_SECRET).encode('utf-8'),
#                    msg=str(msg).encode('utf-8'), digestmod=hashlib.sha256).digest()
#     d2 = base64.b64encode(dig).decode()
#     return d2
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

def initiate_auth(client, username, password):
    #secret_hash = get_secret_hash(username)
    try:
        resp = client.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='ADMIN_NO_SRP_AUTH',
            AuthParameters={
                'USERNAME': username,
                #'SECRET_HASH': secret_hash,
                'PASSWORD': password,
            },
            ClientMetadata={
                'username': username,
                'password': password,
            })
    except client.exceptions.NotAuthorizedException:
        return None, "The username or password is incorrect"
    except client.exceptions.UserNotConfirmedException:
        return None, "User is not confirmed"
    except Exception as e:
        return None, e.__str__()
    return resp, None


def lambda_handler(event, context):
    client = boto3.client('cognito-idp')
    for field in ["username", "password"]:
        if event.get(field) is None:
            return {"error": True,
                    "success": False,
                    "message": f"{field} is required",
                    "data": None}
    resp, msg = initiate_auth(client, event.get('username'), event.get('password'))
    if msg is not None:
        return {'message': msg,
                "error": True, "success": False, "data": None}
    if resp.get("AuthenticationResult"):
        user_data = validate_user(resp["AuthenticationResult"]["AccessToken"])
        return {'message': "success",
                "error": False,
                "success": True,
                "data": {
                    "id_token": resp["AuthenticationResult"]["IdToken"],
                    "refresh_token": resp["AuthenticationResult"]["RefreshToken"],
                    "access_token": resp["AuthenticationResult"]["AccessToken"],
                    "expires_in": resp["AuthenticationResult"]["ExpiresIn"],
                    "token_type": resp["AuthenticationResult"]["TokenType"],
                    "display_name": user_data['data']['name']
                }}
    else:  # this code block is relevant only when MFA is enabled
        return {"error": True,
                "success": False,
                "data": None, "message": None}
