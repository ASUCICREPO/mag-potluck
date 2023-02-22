#!/usr/bin/env ts-node
import {execSync} from "child_process";
import {readFileSync, writeFile} from 'fs';
import {renderFile} from 'template-file';
import {red,green} from "chalk"


const frontendBuildCommands = `cd web
sleep 10
npm install
npm run build
cd ..`
const infrastructureDeployCommands = `cdk deploy --require-approval never --outputs-file ./cdk-outputs.json`

console.log(green('Starting to deploy ASU CIC Project - MagPotluck'));
console.log(green('Deploying Backend...'));
executeCommands(infrastructureDeployCommands)
console.log('Deploying Backend DONE');
console.log('Updating Frontend API url');
const apiurl = getParameter('./cdk-outputs.json','APIURL')

console.log(apiurl)
executeCommands(`rm -rf web/build
rm -rf web/node_modules
rm web/package-lock.json
rm web/src/components/GlobalVariables.js`)
const fileContent = {
    api_url: apiurl
}
const templateFile = 'web/src/components/GlobalVariables_template.js'
const op_file = 'web/src/components/GlobalVariables.js'
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
                console.log('File has been written successfully.');
                executeCommands(frontendBuildCommands);
                console.log('Building Frontend DONE');
                console.log('Redeploying Backend...');
                executeCommands(infrastructureDeployCommands)
                console.log('Deploying Backend DONE');
            }}))
    console.log("File updated")
}

function getParameter(filename:string, parameter:string){
    const data = readFileSync( filename, 'utf-8');
    const datajson = JSON.parse(data)
    return datajson[Object.keys(datajson)[0]][parameter]
}

const syncWait = (ms: number) => {
    const end = Date.now() + ms
    while (Date.now() < end);
}