# Deployment Guide

## Deployment 

### Linux/Unix
1. Install dependencies
    ```shell
        sudo apt-get update
        sudo apt install curl
        sudo apt-get install awscli
        sudo apt-get -y install nodejs
        sudo apt install -y npm
        npm install -g n
        n 18.13.0
    ```
2. Restart the terminal
3. Configure AWS credentials in your system
4. Clone or Download the Zip of this repository
5. Run commands to install NPM dependencies once you are inside the directory
   ```shell
      npm install -g aws-cdk
      npm install ts-node typescript --save-dev --global
      npm install
   ```
6. Provide execution permission to the `Deploy.ts` script
   ```shell
      chmod +x ./Deploy.ts
   ```
7. Run the script for deployment
   ```shell
      ./deploy.ts
   ```
8. The deployment will take around 15 minutes to complete. The screen might look frozen at times, but be patient. 
9. Once the deployment is complete, we can obtain the URL for the deployed website from the output of the `Deploy.ts` script
   ![Deployment Output](Docs/deployment_outputs.png)
