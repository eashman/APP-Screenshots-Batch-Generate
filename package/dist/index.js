const sizeProfiles = {
    "5.5": { dimensions: { longLength: 2208, shortLength: 1242 }, platform: "ios" },
    "10.5": { dimensions: { longLength: 2224, shortLength: 1668 }, platform: "ios" },
    "5.1": { dimensions: { longLength: 1280, shortLength: 800 }, platform: "android" },
    "10": { dimensions: { longLength: 2560, shortLength: 1700 }, platform: "android" },
};
const configKeys = { inputTargetURL: "inputTargetURL", outputTargetURL: "outputTargetURL" };
const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);
//Global Variables
let outputFolder;
let inputFolder;
let newImagesObj = {};
function initConfig() {
    //Set default folder locations
    conf.set(configKeys.inputTargetURL, './screensIn/');
    conf.set(configKeys.outputTargetURL, './screensOut/');
    console.log('Default config set');
}
function loadConfig() {
    if (conf.get(configKeys.inputTargetURL) == null || conf.get(configKeys.outputTargetURL) == null) {
        initConfig();
    }
    else {
        outputFolder = conf.get(configKeys.outputTargetURL);
        inputFolder = conf.get(configKeys.inputTargetURL);
    }
}
function updateConfigByConfigKey(configKey, inputPath) {
    conf.set(configKey, inputPath);
}
var updateConfigInput = function (inputPath) {
    //route the function to the correct configKey
    updateConfigByConfigKey(configKeys.inputTargetURL, inputPath);
};
var updateConfigOutput = function (inputPath) {
    //route the function to the correct configKey
    updateConfigByConfigKey(configKeys.outputTargetURL, inputPath);
};
var showConfigPrintout = function () {
    outputFolder = conf.get(configKeys.outputTargetURL);
    inputFolder = conf.get(configKeys.inputTargetURL);
    console.log();
    console.log('Configuration');
    console.log();
    console.log('Input Folder: ', inputFolder);
    console.log('Ouput Folder: ', outputFolder);
};
function getOutputDimensions(targetProfileName, dimensionsInp) {
    let dimensionsOut;
    let tempProfile = sizeProfiles[targetProfileName];
    //Auto decide which dimensions to use based on input size
    if (dimensionsInp.orientation == "landscape") {
        dimensionsOut = {
            width: tempProfile.dimensions.longLength, height: tempProfile.dimensions.shortLength,
            orientation: dimensionsInp.orientation
        };
    }
    else {
        dimensionsOut = {
            width: tempProfile.dimensions.shortLength, height: tempProfile.dimensions.longLength,
            orientation: dimensionsInp.orientation
        };
    }
    return dimensionsOut;
}
function getInputDimensions(inpImgPath) {
    //Give input dimensions and return dimensions with correct size and orientation
    let sizeOf = require('image-size');
    let dimensionsIn = sizeOf(inpImgPath);
    let dimensions;
    if (dimensionsIn.width >= dimensionsIn.height) {
        dimensions = { width: dimensionsIn.width, height: dimensionsIn.height, orientation: "landscape" };
    }
    else {
        dimensions = { width: dimensionsIn.width, height: dimensionsIn.height, orientation: "portrait" };
    }
    return dimensions;
}
var generateNewScreeshots = function () {
    loadConfig();
    const isImage = require('is-image');
    const fs = require('fs');
    let inpImgPath = "";
    let count = 0;
    console.log("Generate called for: ", inputFolder);
    //For each file found in input folder
    fs.readdirSync(inputFolder).forEach((fName) => {
        inpImgPath = inputFolder + fName;
        if (isImage(inpImgPath)) {
            console.log("Processing: ", inpImgPath);
            count += 1;
            for (let profileSizeName in sizeProfiles) {
                newImagesObj[fName] = {
                    dimensions: getInputDimensions(inpImgPath), fPath: inpImgPath
                };
                processImage(fName, profileSizeName);
            }
        }
    });
    console.log("Generated Screenshots for ", count, " picture/s stored in ", outputFolder);
};
function processImage(fName, profileSizeName) {
    const fs = require('fs-extra');
    const resizeImg = require('resize-img');
    let dimensionsOut = getOutputDimensions(profileSizeName, newImagesObj[fName].dimensions);
    resizeImg(fs.readFileSync(newImagesObj[fName].fPath), { width: dimensionsOut.width, height: dimensionsOut.height }).then(buf => {
        let outImgPath = outputFolder + sizeProfiles[profileSizeName].platform
            + "/" + profileSizeName;
        fs.ensureDir(outImgPath, err => {
            if (err) {
                console.log(err);
            }
            let fileFullPath = outImgPath + "/" + fName;
            fs.writeFileSync(fileFullPath, buf);
        });
    });
}
//Exports Section
exports.updateConfigInput = updateConfigInput;
exports.updateConfigOutput = updateConfigOutput;
exports.showConfigPrintout = showConfigPrintout;
exports.generateNewScreeshots = generateNewScreeshots;