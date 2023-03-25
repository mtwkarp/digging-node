#!/usr/bin/env node
"use strict";

const path = require('path')
const fs = require('fs')
const util = require('util')
const Transform = require('stream').Transform
const zlib= require('zlib')

const args = require('minimist')(process.argv.slice(2), {
    boolean: ["help", 'in', 'out', 'compress', 'decompress'],
    string: ["file"]
});


let BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname)
let OUTFILE = path.join(BASE_PATH, "out.txt")

if(process.env.HELLO) {
    console.log(process.env.HELLO)
}

if(args.help) {
    printHelp();
}
else if(args.in || args._.includes('-')) {
    processFile(process.stdin)
}
else if(args.file) {
    let stream = fs.createReadStream(path.join(BASE_PATH, args.file))
    processFile(stream)
}else {
    error('Incorrect usage', true)
}

function processFile(inStream) {
    let outStream = inStream

    if(args.uncompress) {
        let gunzipStream = zlib.createGunzip();

        outStream = outStream.pipe(gunzipStream)
    }

    let upperStream = new Transform({
        transform(chunk, enc, nextcb) {
            this.push(chunk.toString().toUpperCase())
            nextcb()
        }
    })

    outStream = outStream.pipe(upperStream)

    if(args.compress) {
        let gzipStream = zlib.createGzip()
        outStream = outStream.pipe(gzipStream)
        OUTFILE=`${OUTFILE}.gz`
    }

    let targetStream

    if(args.out) {
        targetStream = process.stdout

    }else {
        targetStream = fs.createWriteStream(OUTFILE)
    }

    outStream.pipe(targetStream)
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if(includeHelp) printHelp();
}
function printHelp() {
    console.log('ex2 usage')
    console.log('ex2.js --help')
    console.log('')
    console.log('--help         print this help')
    console.log("--in,          process stdin")
    console.log("--out,         print to stdout")
    console.log("--compress     gzip to output")
    console.log("--decompress   decompress file")
    console.log('')
};
