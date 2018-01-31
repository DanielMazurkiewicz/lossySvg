const matchNumbersAndSingleChars = /([+-]?\d+(?:\.\d+)?|[a-zA-Z])/g;
const matchNumbers = /([+-]?\d+(?:\.\d+)?)/g;

function createVec(converted, isModule) {
  let output;
  if (isModule) {
    output = 'module.exports={'
    propsOfConverted = [];
    for (prop in converted) {
      propsOfConverted.push(prop + ':' + JSON.stringify(converted[prop]));
    }
    output += propsOfConverted.join(',') + '}'
  } else {
    output = JSON.stringify(converted);
  }
  return output;
}

function createSvg(converted, color) {
  let output;
  if (converted.o) {
    output = '<svg viewBox="' 
      + converted.o.join(' ') 
      + ' ' + (converted.o[0] + converted.w)  
      + ' ' + (converted.o[1] + converted.h)
      + '" xmlns="http://www.w3.org/2000/svg"><path d="';
  } else {
    output = '<svg width="' + converted.w 
      + '" height="' + converted.h 
      + '" xmlns="http://www.w3.org/2000/svg"><path d="';
  }
  output += converted.p + '"';
  if (color) {
    output += ' fill="' + color + '"';
  }
  output += '/></svg>';

  return output;
}

function isSign(char) {
  return char === '-' || char === '+';
}

function isDot(char) {
  return char === '.';
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isLetter(char) {
  return (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z');
}


const pathToArray = path => {
  const result = [];
  const l = path.length;
  let i = 0;
  let digits;

  function getDigits() {
    let digits = '';

    if (i >= l) {
      return digits;
    }

    while (isDigit(path[i])) {
      digits += path[i++];
      if (i >= l) {
        return digits;
      }
    }
    return digits;
  }


  while (i < l) {
    let c = path[i++];
    if (isLetter(c)) {
      result.push(c);
    } else if (isSign(c)) {
      digits = c;
      c = path[i];
      if (isDot(c)) {
        i++;
        digits += c + getDigits();
        result.push(parseFloat(digits));
        digits = '';
      } else if (isDigit(c)) {
        i++;
        digits += c + getDigits();
        c = path[i];
        if (isDot(c)) {
          i++;
          digits += c + getDigits();
        }
        result.push(parseFloat(digits));
        digits = '';      
      }
    } else if (isDot(c)) {
      digits = c + getDigits();
      result.push(parseFloat(digits));
      digits = '';
    } else if (isDigit(c)) {
      digits = c + getDigits();
      c = path[i];
      if (isDot(c)) {
        i++;
        digits += c + getDigits();
      }
      result.push(parseFloat(digits));
      digits = '';
    }
  }
  return result;
}


const getPathObject = function(svgText) {
  let width, height, viewBox, path='';

  const parser = require('htmljs-parser').createParser({
      onText: function(event) {
          // Text within an HTML element 
          var value = event.value;
      },
   
      onPlaceholder: function(event) {
          //  ${<value>]} // escape = true 
          // $!{<value>]} // escape = false 
          var value = event.value; // String 
          var escaped = event.escaped; // boolean 
          var withinBody = event.withinBody; // boolean 
          var withinAttribute = event.withinAttribute; // boolean 
          var withinString = event.withinString; // boolean 
          var withinOpenTag = event.withinOpenTag; // boolean 
          var pos = event.pos; // Integer 
      },
   
      onCDATA: function(event) {
          // <![CDATA[<value>]]> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onOpenTag: function(event) {
          var tagName = event.tagName; // String 
          var attributes = event.attributes; // Array 
          var argument = event.argument; // Object 
          var pos = event.pos; // Integer
          if (tagName === 'svg') {
            attributes.forEach(attribute => {
              switch (attribute.name) {
                case 'viewBox': viewBox = attribute.literalValue
                                  .match(matchNumbers)
                                  .map(n=>parseFloat(n));
                  break;
                case 'width': width = parseFloat(attribute.literalValue); break;
                case 'height': height = parseFloat(attribute.literalValue); break;
              }
            });
          } else if (tagName === 'path') {
            attributes.forEach(attribute => {
              switch (attribute.name) {
                case 'd': path += attribute.literalValue; break;
              }
            });
          }
      },
   
      onCloseTag: function(event) {
          // close tag 
          var tagName = event.tagName; // String 
          var pos = event.pos; // Integer 
      },
   
      onDocumentType: function(event) {
          // Document Type/DTD 
          // <!<value>> 
          // Example: <!DOCTYPE html> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onDeclaration: function(event) {
          // Declaration 
          // <?<value>?> 
          // Example: <?xml version="1.0" encoding="UTF-8" ?> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onComment: function(event) {
          // Text within XML comment 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onScriptlet: function(event) {
          // Text within <% %> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onError: function(event) {
          // Error 
          var message = event.message; // String 
          var code = event.code; // String 
          var pos = event.pos; // Integer 
      }
  });
   
  parser.parse(svgText);

  return {width, height, viewBox, path}
}


const getPathInstructions = function (path) {
  if (!path) return [];

  const instructions = [];
//  const pathSplitted = path.match(matchNumbersAndSingleChars)
//    .map(e => isNaN(e) ? e : parseFloat(e));
  const pathSplitted = pathToArray(path);

  let currentInstruction, dataFunction, i;


  const getParameter = () => {
    let param = pathSplitted[i];
    if (!currentInstruction.parameters) {
      currentInstruction.parameters = [param];
    } else {
      currentInstruction.parameters.push(param);
    }
  }  

  const getDimmension = () => {
    let dim = pathSplitted[i];
    if (!currentInstruction.dimmensions) {
      currentInstruction.dimmensions = [dim];
    } else {
      currentInstruction.dimmensions.push(dim);
    }
  }


  const getCoordinates = () => {
    let x = pathSplitted[i++];
    let y = pathSplitted[i];
    if (!currentInstruction.points) {
      currentInstruction.points = [{x,y}];
    } else {
      currentInstruction.points.push({x,y});
    }
  }

  const getCoordinateX = () => {
    let x = pathSplitted[i];
    if (!currentInstruction.points) {
      currentInstruction.points = [{x}];
    } else {
      currentInstruction.points.push({x});
    }
  }

  const getCoordinateY = () => {
    let y = pathSplitted[i];
    if (!currentInstruction.points) {
      currentInstruction.points = [{y}];
    } else {
      currentInstruction.points.push({y});
    }
  }

  const getArc = () => {
    getDimmension(); i++;
    getDimmension(); i++;
    getParameter(); i++;
    getParameter(); i++;
    getParameter(); i++;
    getCoordinates();
  }

  const entityPointsNumber = {
    M: 1,
    L: 1,
    H: 1,
    V: 1,
    Z: 0,
    C: 3,
    S: 2,
    Q: 2,
    T: 1,
    A: 1
  }

  for (i = 0; i < pathSplitted.length; i++) {
    let element = pathSplitted[i];
    switch (element) {
      case 'C':
      case 'S':
      case 'Q':
      case 'T':
      case 'M':
      case 'L':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: false});
        dataFunction = getCoordinates;
        break;

      case 'c':
      case 's':
      case 'q':
      case 't':
      case 'm':
      case 'l':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: true});
        dataFunction = getCoordinates;
        break;

      case 'H':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: false});
        dataFunction = getCoordinateX;
        break;
      case 'h':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: true});
        dataFunction = getCoordinateX;
        break;
      case 'V':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: false});
        dataFunction = getCoordinateY;
        break;
      case 'v':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: true});
        dataFunction = getCoordinateY;
        break;

      case 'Z':
      case 'z':
        instructions.push(currentInstruction = {code: 'Z', pLength: entityPointsNumber[element.toUpperCase()], relative: false});
        dataFunction = null;
        break;
      case 'A':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: false});
        dataFunction = getArc;
        break;
      case 'a':
        instructions.push(currentInstruction = {code: element, pLength: entityPointsNumber[element.toUpperCase()], relative: true});
        dataFunction = getArc;
        break;

      default:
        if (dataFunction) dataFunction();
    }
  }

  return instructions;
}

const numberToString = (value, maxDecimals) => {
  maxDecimals = maxDecimals || 6;
  let real = value.toFixed(maxDecimals).split('.');
  
  if (real.length === 1) return real[0];

  let decimals = real[1];
  let i = maxDecimals - 1;

  while (decimals[i] === '0' && i >= 0) {
    i--;
  }

  if (i < 0 ) return real[0];
  i++;

  decimals = decimals.substr(0, i);
  if (real[0] === '-0') return '-.' + decimals;
  if (real[0] === '0') return '.' + decimals;
  return real[0] + '.' + decimals;
}

const instructionsToString = (instructions, decimals) => {
  let result = '';
  let afterDecimals;
  const pushNumber = (value, afterInstruction) => {
    if (value !== undefined) {
      const stringValue = numberToString(value, decimals);
      if (value < 0 || afterInstruction) { //assume auto conversion of value will take place
        result += stringValue;
      } else if (stringValue.startsWith('.') && afterDecimals) {
        result += stringValue;
      } else {
        result += ' ' + stringValue;
      }
      afterDecimals = stringValue.includes('.');
    }
  }

  instructions.forEach(instruction => {
    result += instruction.code;
    let coordinates = instruction.points;
    let length, coord;

    switch (instruction.code) {
      case 'C':
      case 'S':
      case 'Q':
      case 'T':
      case 'M':
      case 'L':
      case 'c':
      case 's':
      case 'q':
      case 't':
      case 'm':
      case 'l':
        if (!coordinates) break;
        length = coordinates.length;

        coord = coordinates[0];
        pushNumber(coord.x, true);
        pushNumber(coord.y);
        for (let i = 1; i < length; i++) {
          coord = coordinates[i];
          pushNumber(coord.x);
          pushNumber(coord.y);
        }
        break;
      case 'H':
      case 'h':
      case 'V':
      case 'v':
        if (!coordinates) break;
        length = coordinates.length;

        coord = coordinates[0];
        if (coord.x !== undefined) {
          pushNumber(coord.x, true);
        } else {
          pushNumber(coord.y, true);
        }
        for (let i = 1; i < length; i++) {
          coord = coordinates[i];
          pushNumber(coord.x);
          pushNumber(coord.y);
        }
        break;
      case 'a':
      case 'A':
        let dimensions = instruction.dimensions;
        if (!dimensions) break;
        let parameters = instruction.parameters;
        for (let dIndex = 0, pIndex=0, cIndex=0; cIndex < coordinates.length; cIndex++) {

          pushNumber(dimensions[dIndex++], cIndex === 0);
          pushNumber(dimensions[dIndex++]);

          pushNumber(parameters[pIndex++]);
          pushNumber(parameters[pIndex++]);
          pushNumber(parameters[pIndex++]);

          let coord = coordinates[cIndex];
          pushNumber(coord.x);
          pushNumber(coord.y);
        }
    }
  });
  return result;
}

const getAbsolutePathInstructions = (instructions) => {
  const result = [];
  let baseX = 0, baseY = 0;
  let x = 0, y = 0;
  instructions.forEach(i => {
    if (!i.points) {
      result.push(i);
      return;
    };

    if (i.relative) {
      let instruction = Object.assign({}, i)
      instruction.code = instruction.code.toUpperCase();
      instruction.relative = false;
      let points = instruction.points = [];
      const modulo = i.pLength - 1;
      i.points.forEach((p, index) => {
        if (p.x !== undefined && p.y !== undefined) {
          x = p.x + baseX; y = p.y + baseY;
          points.push({x, y});
          if (index % i.pLength === modulo) {
            baseX = x; baseY = y;
          }
        } else {
          if (p.x !== undefined) {
            x = p.x + baseX;
            points.push({x});
            baseX = x;
          } else {
            y = p.y + baseY;
            points.push({y});
            baseY = y;
          }
        }
      });

      result.push(instruction);
    } else {
      let point = i.points[i.points.length - 1];
      if (point.x !== undefined) baseX = point.x;
      if (point.y !== undefined) baseY = point.y;
      result.push(i);
    }
  });
  return result;
}

const getRelativePathInstructions = (instructions) => {
  const result = [];
  let baseX = 0, baseY = 0;
  let x, y;
  instructions.forEach(i => {
    if (!i.points) {
      result.push(i);
      return;
    };

    const modulo = i.pLength - 1;

    if (i.relative) {
      i.points.forEach((p, index) => {
        if (index % i.pLength === modulo) {
          if (p.x !== undefined) baseX += p.x;
          if (p.y !== undefined) baseY += p.y;
        }
      });

      result.push(i);

    } else {
      let instruction = Object.assign({}, i)
      instruction.code = instruction.code.toLowerCase();
      instruction.relative = true;
      let points = instruction.points = [];

      i.points.forEach((p, index) => {
        if (p.x !== undefined && p.y !== undefined) {
          x = p.x - baseX; y = p.y - baseY;
          points.push({x, y});
          if (index % i.pLength === modulo) {
            baseX = p.x; baseY = p.y;
          }
        } else {
          if (p.x !== undefined) {
            x = p.x - baseX;
            points.push({x});
            baseX = p.x;
          } else {
            y = p.y - baseY;
            points.push({y});
            baseY = p.y;
          }
        }
      });

      result.push(instruction);
    }
  });
  return result;
}

const getIntegerAbsolutePathInstructions = (instructions, scale, baseX, baseY) => {
  const result = [];
  scale = scale || 1;
  baseX = baseX || 0;
  baseY = baseY || 0;

  instructions = getAbsolutePathInstructions(instructions);
  instructions.forEach(i => {
    if (!i.points) {
      result.push(i);
      return;
    };
    let instruction = Object.assign({}, i)
    let points = instruction.points = [];
    i.points.forEach(p => {
      let x, y;
      if (p.x !== undefined) x = Math.round((baseX + p.x) * scale);
      if (p.y !== undefined) y = Math.round((baseY + p.y) * scale);
      points.push({x, y});
    });

    if (instruction.dimensions) {
      let dimmensions = instruction.dimensions = [];
      i.dimensions.forEach(d => {
        dimmensions.push(Math.round(d * scale))
      });
    }

    result.push(instruction);
  });
  return result;
}

const compactInstructions = instructions => {
  const result = [];
  let previous, current, instruction;
  previous = instructions[0];
  instruction = Object.assign({}, previous);

  for (i = 1; i < instructions.length; i++) {
    current = instructions[i];

    if (previous.code === current.code) {
      if (instruction.points) instruction.points = instruction.points.concat(current.points);
      if (instruction.dimmensions) instruction.dimmensions = instruction.dimmensions.concat(current.dimmensions);
      if (instruction.parameters) instruction.parameters = instruction.parameters.concat(current.parameters);
    } else {
      result.push(instruction);
      instruction = Object.assign({}, current)
    }

    previous = current;
  }
  result.push(instruction);
  return result;
}

const convert = function(svgText, options) {
  options = options || {};
  let quantums, scale;
  let w, h, p, offX, offY;

  const {width, height, viewBox, path} = getPathObject(svgText);
  if (viewBox) {
    w = viewBox[2] - viewBox[0];
    h = viewBox[3] - viewBox[1];
    offX = viewBox[0];
    offY = viewBox[1];
  } else {
    w = width;
    h = height;
    offX = 0;
    offY = 0;
  }
  let instructions = getPathInstructions(path);

  if (options.precision) {
    quantums = Math.round(1 / (options.precision / 100));

    if (w > h) {
      scale = quantums / w;
      w = quantums
      h = Math.round(scale * h);
    } else {
      scale = quantums / h;
      h = quantums;
      w = Math.round(scale * w);
    }

    //scale = 0.9;
    //instructions = getAbsolutePathInstructions(instructions)
    instructions = getIntegerAbsolutePathInstructions(instructions, scale, -offX, -offY);
    instructions = getRelativePathInstructions(instructions);
    instructions = compactInstructions(instructions);
    offX = 0;
    offY = 0;
  }
  p = instructionsToString(instructions, options.decimals);

  if (offX || offY) return {o:[offX, offY], w, h, p};
  return {w, h, p};
}



module.exports = {
  createVec,
  createSvg,
  pathToArray,
  getPathObject,
  getPathInstructions,
  instructionsToString,
  getAbsolutePathInstructions,
  getRelativePathInstructions,
  getIntegerAbsolutePathInstructions,
  compactInstructions,
  convert
}