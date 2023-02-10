# Mag-Potluck

## Project Overview
Mag potluck is a serverless web application that eases the communication between health care providers and transport agencies in rural areas. 
This aims to help the elderly to avoid fruitless hospital visits in case of a cancelled or postponed appointment.
## Description
Older adults in rural communities overcome long distances, limited
infrastructure and strained resources to access healthcare.
One way non-emergency medical transportation providers support these
communities is by facilitating transportation to Healthcare Providers.
Transportation Agency resources get strained when they are not notified
immediately about rescheduled medical appointments.

Currently, 17% of Transportation Agency rides are canceled on arrival to
Healthcare Providers.  This allows unnecessary trips to be taken and time
and resources to be wasted, both on the side of the patient and the
transportation provider.
## High Level Architecture
![Architecture](Docs/Architecture-Diagram.jpeg)
## Deployment 
### Linux/Unix
1. Install dependencies
    ```shell
        sudo apt-get update
        sudo apt-get install awscli
        sudo apt-get -y install nodejs
        sudo apt install -y npm
        npm install -g n
        n 18.13.0
    ```
2. Run the script for deployment
   ```shell
      ./deploy.ts
   ```

## User Guide / How to use

## Change Log

## Lessons Learned

## Credits

## License(MIT) 