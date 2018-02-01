# lossySvg
Minified SVG vector file paths (for purpouse of web icons)

# Introduction

This tool aim is to produce as minimal as possible output, with single colored vector images (vector web icons). It can be used in plain javascript to set 'd' property of SVG 'PATH' element in DOM and style its color later via CSS or can minify existing SVG files.
Accepts bitmaps like PNG, JPG, BMP ... (if you use so, remember that you can adjust threshold settings by option -t)
Accepts SVG files, but might not work well with all.

For details of usage as module have a quick look into a code, it is not very clean yet, but nothing super fancy there.

# Installation

npm install -g lossysvg

# Command line

Example usages:
      lossysvg -i ./image.jpg -m -s -j -t 100 -p 1.5 -d 3 -c green
      lossysvg -i ./image.svg -m -s -j -p 1.5 -d 3 -c blue

Command line options:
```
      -i, -input   <file> - input file (jpg, png, bmp, svg)
      -j, -json    [file] - JSON output file
      -m, -module  [file] - node module output
      -s, -svg     [file] - svg file output

      -c          <color> - add fill color for svg
      -t         <number> - threshold for bitmap input 0-255 (default: automatic)
      -p         <number> - keep precision at given percentage of image size
                            (smaller numbers = better quality and bigger file size)
      -d         <number> - max number of decimals
      -h, --h, --help     - HELP! ;-)
```

# TODO:

 - clean paths from non visible paths due to a very small size...
 - modify coordinates so it still looks ok and gives best compression results in standard compression methods used in web
 - add translations support
 - clean code, add some tests