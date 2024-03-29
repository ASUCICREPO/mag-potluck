import boto3
import hmac
import hashlib
import base64
import os

USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['CLIENT_ID']
#CLIENT_SECRET = os.environ['CLIENT_SECRET']


# def get_secret_hash(username):
#     msg = username + CLIENT_ID
#     dig = hmac.new(str(CLIENT_SECRET).encode('utf-8'),
#                    msg=str(msg).encode('utf-8'), digestmod=hashlib.sha256).digest()
#     d2 = base64.b64encode(dig).decode()
#     return d2


def lambda_handler(event, context):
    for field in ["phone", "email", "password", "name"]:
        if not event.get(field):
            return {"error": False, "success": True, 'message': f"{field} is not present", "data": None}
    email = event["email"]
    password = event['password']
    phone = event['phone']
    name = event["name"]
    client = boto3.client('cognito-idp')
    try:
        resp = client.sign_up(
            ClientId=CLIENT_ID,
            #SecretHash=get_secret_hash(username),
            Username=email,
            Password=password,
            UserAttributes=[
                {
                    'Name': "name",
                    'Value': name
                },
                {
                    'Name': "email",
                    'Value': email
                },
                {
                    'Name':"phone_number",
                    'Value': phone
                }
            ],
            ValidationData=[
                {
                    'Name': "email",
                    'Value': email
                },
                {
                    'Name': "custom:username",
                    'Value': email
                }
            ])

    except client.exceptions.UsernameExistsException as e:
        return {"error": True,
                "success": False,
                "message": "This username already exists",
                "data": None}
    except client.exceptions.InvalidPasswordException as e:

        return {"error": True,
                "success": False,
                "message": "Password should have Caps,\
                          Special chars, Numbers",
                "data": None}
    except client.exceptions.UserLambdaValidationException as e:
        return {"error": True,
                "success": False,
                "message": "Email already exists",
                "data": None}

    except Exception as e:
        return {"error": True,
                "success": False,
                "message": str(e),
                "data": None}

    return {"error": False,
            "success": True,
            "message": "Please confirm your signup, \
                        check Email for validation code",
            "data": None}
