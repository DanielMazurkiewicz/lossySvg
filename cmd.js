#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const svgPath = require('./lossySvgPath');

const convert = svgPath.readAndConvert;
const {createVec, createSvg} = svgPath;

let inputFile, moduleOutput, jsonOutput, svgOutput, mode, color;
let options = {};

process.argv.forEach((val, index) => {
  switch(val) {
    case '-i':  case '-input': mode = 'input'; break;
    case '-s':    case '-svg': mode = 'svg';    svgOutput = true; break;
    case '-m': case '-module': mode = 'module'; moduleOutput = true; break;
    case '-j':   case '-json': mode = 'json';   jsonOutput = true; break;
    case '-t': mode = 'threshold'; break;
    case '-p': mode = 'precision'; break;
    case '-d': mode = 'decimals'; break;
    case '-c': mode = 'color'; break;
    case '-h': case '--h': case '--help':
    console.log(`
    Example usages:
      lossysvg -i ./image.jpg -m -s -j -t 100 -p 1.5 -d 3 -c green
      lossysvg -i ./image.svg -m -s -j -p 1.5 -d 3 -c blue

      -i, -input   <file> - input file (jpg, png, bmp, svg)
      -j, -json    [file] - JSON output file
      -m, -module  [file] - node module output
      -s, -svg     [file] - svg file output

      -c          <color> - add fill color for svg
      -t         <number> - threshold for bitmap input 0-255 (default: automatic)
      -p         <number> - keep precision at given percentage of image size
                            (smaller numbers = better quality)
      -d         <number> - max number of decimals
      -h, --h, --help     - HELP! ;-)

    `);
      break;
    default:
      switch (mode) {
        case 'input':   inputFile = val; break;
        case 'svg':     svgOutput = val; break;
        case 'json':    jsonOutput = val; break;
        case 'module':  moduleOutput = val; break;

        case 'threshold': options.threshold = parseInt(val); break;
        case 'precision': options.precision = parseFloat(val); break;
        case 'decimals':  options.decimals = parseInt(val); break;

        case 'color': color = val; break;
        default:
          //throw "Invalid argument: " + val;
      }
      mode = null;
  }
});

if (!inputFile) return;
const inputFileParsed = path.parse(inputFile);
const nameBase = path.join(inputFileParsed.dir, inputFileParsed.name);


convert(inputFile, options, (converted, length, svg) => {
  let output;
  console.log('   in:     ' + length + ' bytes');
  console.log();

  if (moduleOutput) {
    if (moduleOutput === true) moduleOutput = nameBase + '.vec.js';
    output = createVec(converted, true);
    fs.writeFileSync(moduleOutput, output);
    console.log('   module: ' + output.length + ' bytes');
    console.log('   ratio:  ' + (100*output.length/length) + ' %');
    console.log();
  }

  if (jsonOutput) {
    if (jsonOutput === true) jsonOutput = nameBase + '.vec.json';
    output = createVec(converted, false);
    fs.writeFileSync(jsonOutput, output);
    console.log('   json:   ' + output.length + ' bytes');
    console.log('   ratio:  ' + (100*output.length/length) + ' %');
    console.log();
  }

  if (svgOutput) {
    if (svgOutput === true) svgOutput = nameBase + '.min.svg';
    output = createSvg(converted, color);
    fs.writeFileSync(svgOutput, output);
    console.log('   svg:    ' + output.length + ' bytes');
    console.log('   ratio:  ' + (100*output.length/length) + ' %');
    console.log();
  }



});


