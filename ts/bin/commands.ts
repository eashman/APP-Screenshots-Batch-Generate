#!/usr/bin/env node
let minimist = require('minimist')
let functionsLibrary = require('../dist/helper-functions.js');
//let index = require('../dist/index.js');

import {ScreenshotGenerator} from "../dist/index";
let index = new ScreenshotGenerator();
// let args = minimist(process.argv.slice(2), {
//   string: 'in',
//   string: 'out',
//   boolean: ['version'],     // --version
//   boolean: ['generate'],
//   boolean: ['config'],
//   boolean: ['android'],
//   boolean: ['ios'],
//   alias: { h: 'help', g: 'generate', v: 'version', c: 'config' },
// })
let args = minimist(process.argv.slice(2), {
    string: ['in','out'],
    boolean: ['version','generate','config','android','ios'],
    alias: { h: 'help', g: 'generate', v: 'version', c: 'config' },
  })

//console.log(args);
if(args.v || args.h || args.in  || args.out || args.c || args.g || args.android || args.ios){
if (args.v) {
  functionsLibrary.printVersion();
}
if (args.h) {
  functionsLibrary.printHelp();
}
if (args.in) {

  index.updateConfigInput(args.in);
}
if (args.out) {
  index.updateConfigOutput(args.out);
}
if (args.c) {
  index.showConfigPrintout();
}
//Place this last to ensure configs are set first if present
if (args.ios) {
  index.generateNewScreeshots("ios");
  
}
if (args.android) {
  index.generateNewScreeshots("android");
}
// if (args.g) {
//   index.generateNewScreeshots();
// }

}else{
  console.log("No options selected!");
  functionsLibrary.printHelp();
}
