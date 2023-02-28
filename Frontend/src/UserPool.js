import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_G48QgJZXg",
    ClientId: "hvnq00o742m3gaom87p2l818e"
}

export default new CognitoUserPool(poolData);