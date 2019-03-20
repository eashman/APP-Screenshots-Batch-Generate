import * as _ from "lodash";
//Const imports
const validPath = require('valid-path');

const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);
const isImage = require('is-image');

//const fs = require('fs');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
//Config default locations

type Platform = "android" | "ios";

const sizeProfiles: SizeProfiles = {
    "5.5": { dimensions: { longLength: 2208, shortLength: 1242 }, platform: "ios" },
    "10.5": { dimensions: { longLength: 2224, shortLength: 1668 }, platform: "ios" },
    "5.1": { dimensions: { longLength: 1280, shortLength: 800 }, platform: "android" },
    "10": { dimensions: { longLength: 2560, shortLength: 1700 }, platform: "android" },
};

type Orientation = "portrait" | "landscape";
type Dimension = number;
type FName = string;
type FPath = string;
type ConfigKey = "inputTargetURL" | "outputTargetURL"
const configKeys = { inputTargetURL: "inputTargetURL", outputTargetURL: "outputTargetURL" }

interface Dimensions {
    height: Dimension,
    width: Dimension,
    orientation: Orientation
}

interface ProfileDimensions {
    longLength: Dimension,
    shortLength: Dimension,
}

interface ImageSize {
    width: Dimension,
    height: Dimension,
}

interface SizeProfile {
    dimensions: ProfileDimensions;
    platform: Platform;
}

interface SizeProfiles {
    [sizeName: string]: SizeProfile;
}
interface ImagesObject {
    [fileName: string]: { dimensions: Dimensions, fPath: FPath };
}


//Global Variables
let outputFolder: string;
let inputFolder: string;
let newImagesObj: ImagesObject = {};

function initConfig() {
    //Set default folder locations
   // conf.set(configKeys.inputTargetURL, './screensIn/');
   // conf.set(configKeys.outputTargetURL, './screensOut/');
    conf.set(configKeys.inputTargetURL, '');
    conf.set(configKeys.outputTargetURL, '');
    console.log('Default config set');

}
function loadConfig() {

    if (conf.get(configKeys.inputTargetURL) == null || conf.get(configKeys.outputTargetURL) == null) {
        initConfig();
    } else {
        outputFolder = conf.get(configKeys.outputTargetURL);
        inputFolder = conf.get(configKeys.inputTargetURL);
    }
    //Check for no path

    if(checkPath("input path",inputFolder) && 
    checkPath("output path",outputFolder)){
        return true;
    }else{
        return false;
    }
}

function checkPath(pathName:string,fPath:FPath){
    let validatedPath:FPath;

    if(fPath==""){
        folderError(pathName);
        return false;
    } 
    validatedPath = validPath(fPath);
    if (validatedPath) {
        if(fPath[fPath.length-1]=='/'){
            return true;
        }
        else{
            console.error("The path entered for ",pathName, " was not a directory.");
            return false;
        }
    } else {
        console.error(validPath);
        return false;
    }
}
function folderError(folderName:FName){
    console.log("Error:",folderName," not set! Please type -h to find instructions.");
}

function updateConfigByConfigKey(configKey, inputPath: FPath) {
    conf.set(configKey, inputPath);
}
var updateConfigInput = function (inputPath: FPath) {
        //route the function to the correct configKey
    updateConfigByConfigKey(configKeys.inputTargetURL, inputPath)
}

var updateConfigOutput = function (inputPath: FPath) {
        //route the function to the correct configKey
    updateConfigByConfigKey(configKeys.outputTargetURL, inputPath)
}

var showConfigPrintout = function () {
    outputFolder = conf.get(configKeys.outputTargetURL);
    inputFolder = conf.get(configKeys.inputTargetURL);
    console.log();
    console.log('Configuration');
    console.log();
    console.log('Input Folder: ', inputFolder);
    console.log('Ouput Folder: ', outputFolder);
//need a way to reset to default locations

}

function getOutputDimensions(targetProfileName: string, dimensionsInp: Dimensions): Dimensions {
    let dimensionsOut: Dimensions;
    let tempProfile = sizeProfiles[targetProfileName];
    //Auto decide which dimensions to use based on input size
    if (dimensionsInp.orientation == "landscape") {
        dimensionsOut = {
            width: tempProfile.dimensions.longLength, height: tempProfile.dimensions.shortLength,
            orientation: dimensionsInp.orientation
        };
    } else {
        dimensionsOut = {
            width: tempProfile.dimensions.shortLength, height: tempProfile.dimensions.longLength,
            orientation: dimensionsInp.orientation
        };
    }

    return dimensionsOut;
}

function getInputDimensions(inpImgPath: FPath): Dimensions {
    //Give input dimensions and return dimensions with correct size and orientation
    let sizeOf = require('image-size');
    let dimensionsIn: ImageSize = sizeOf(inpImgPath);
    let dimensions: Dimensions;

    if (dimensionsIn.width >= dimensionsIn.height) {
        dimensions = { width: dimensionsIn.width, height: dimensionsIn.height, orientation: "landscape" };
    } else {
        dimensions = { width: dimensionsIn.width, height: dimensionsIn.height, orientation: "portrait" }
    }
    return dimensions;
}

var generateNewScreeshots = function () {

    if(loadConfig()){

    let inpImgPath: FName = "";
    let count=0;
    console.log("Generate called for: ", inputFolder);

    //If no input folder found create it
    fs.ensureDir(inputFolder, err => {

    //For each file found in input folder
    fs.readdirSync(inputFolder).forEach((fName: FName) => {
        inpImgPath = inputFolder + fName;
        if (isImage(inpImgPath)) {
            console.log("Processing: ", inpImgPath);
            count+=1;
            for (let profileSizeName in sizeProfiles) {

                newImagesObj[fName] = {
                    dimensions: getInputDimensions(inpImgPath), fPath: inpImgPath
                };
                processImage(fName, profileSizeName);
            }
        }
    });
    console.log("Generated Screenshots for ",count," picture/s stored in ",outputFolder);
    })
}
}

function processImage(fName: FName, profileSizeName: string) {

    let dimensionsOut = getOutputDimensions(profileSizeName, newImagesObj[fName].dimensions);

    resizeImg(fs.readFileSync(newImagesObj[fName].fPath),
        { width: dimensionsOut.width, height: dimensionsOut.height }).then(buf => {
            let outImgPath = outputFolder + sizeProfiles[profileSizeName].platform
                + "/" + profileSizeName;
            fs.ensureDir(outImgPath, err => {
                if (err) {
                    console.log(err);
                }
                let fileFullPath = outImgPath + "/" + fName;
                fs.writeFileSync(fileFullPath, buf);
            })
        });
}

//Exports Section
exports.updateConfigInput = updateConfigInput;
exports.updateConfigOutput = updateConfigOutput;
exports.showConfigPrintout = showConfigPrintout;
exports.generateNewScreeshots = generateNewScreeshots;

