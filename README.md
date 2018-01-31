# lossySvg
Minified SVG vector file paths (for purpouse of web icons)

# Introduction

This tool is not intended to work with entire SVG files, it works only with PATH elements of SVG files. It currently works well with potrace vectorized bitmaps (Inscape vectorized too, since it uses potrace). Its aim is to produce as minimal as possible output, with single colored vector images. It can be used in plain javascript to set 'path' property on DOM element and style its color via CSS, or can minify existing SVG files.
For details of module usage have a quick look into a code, it is not very clean yet, but nothing super fancy there.

# Installation

npm install -g lossySvg

# Command line

Example usage: lossysvg -i input.svg -p 1.5 -d 3 -m -s -j -c green

Command line options:
```
      -i, -input   <file> - input file
      -j, -json    [file] - JSON output file
      -m, -module  [file] - node module output
      -s, -svg     [file] - svg file output
      -c          <color> - fill color for svg
      -p         <number> - keep precision at given percentage of image size
                            (smaller numbers = better quality)
      -d         <number> - max number of decimals
      -h, --h, --help     - HELP! ;-)
```

# TODO:

 - clean paths from non visible paths due to a very small size...
 - modify coordinates so it still looks ok and gives best compression results in standard compression methods used in web
 - clean code, add some tests