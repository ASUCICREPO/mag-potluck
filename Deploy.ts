#!/usr/bin/env ts-node
import {execSync} from "child_process";
import {readFileSync, writeFile} from 'fs';
import {renderFile} from 'template-file';



const frontendBuildCommands = `cd Frontend
npm install
npm run build
cd ..`
const infrastructureDeployCommands = `cd Backend
npm install
cdk deploy --require-approval never --outputs-file ./cdk-outputs.json
cd ..`
const removeTempFiles = `rm -rf Frontend/build
rm -rf Frontend/node_modules
rm Frontend/package-lock.json
rm Frontend/src/components/GlobalVariables.js`

var colors = require('colors/safe');

console.log(colors.green('Starting to deploy ASU CIC Project - MagPotluck'));
console.log(colors.green('Deploying Backend...'));
executeCommands(infrastructureDeployCommands)
console.log('Deploying Backend DONE');
console.log('Updating Frontend API url');
const apiurl = getParameter('Backend/cdk-outputs.json','APIURL')

console.log(apiurl)
executeCommands(removeTempFiles)
const fileContent = {
    api_url: apiurl
}
const templateFile = 'Frontend/src/components/GlobalVariables_template.js'
const op_file = 'Frontend/src/components/GlobalVariables.js'
updateTemplateFIle(fileContent,templateFile,op_file)

function executeCommands(command:string){
    try {
        const outputs = execSync(command,{"encoding": "utf8"}).toString();
        console.log(outputs)
    } catch (error){
        console.log(error)
    }
}
function updateTemplateFIle(data: any, templateFile: string,outputFile:string) {
    const x = renderFile(templateFile, data)
    x.then(contents =>
        writeFile(outputFile, contents, (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log(colors.green('File has been written successfully.'));
                executeCommands(frontendBuildCommands);
                console.log(colors.green('Building Frontend DONE'));
                console.log(colors.green('Redeploying Backend...'));
                executeCommands(infrastructureDeployCommands)
                console.log(colors.green('Deploying Backend DONE'));
                const webUrl = getParameter('Backend/cdk-outputs.json','WEBSITEURL')
                console.log(colors.green("Website URL : https://" + webUrl))
            }}))
    console.log("File updated")
}

function getParameter(filename:string, parameter:string) {
    const data = readFileSync(filename, 'utf-8');
    const datajson = JSON.parse(data)
    return datajson[Object.keys(datajson)[0]][parameter]
}