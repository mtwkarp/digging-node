#!/usr/bin/env node
"use strict";

const path = require('path')
const fs = require('fs')
const util = require('util')
const Transform = require('stream').Transform
const zlib= require('zlib')
const CAF = require('caf')

const args = require('minimist')(process.argv.slice(2), {
    boolean: ["help", 'in', 'out', 'compress', 'decompress'],
    string: ["file"]
});

processFile = CAF(processFile)
function streamComplete(stream) {
    return new Promise(function (res) {
           stream.on('end', res)
    })
}


let BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname)
let OUTFILE = path.join(BASE_PATH, "out.txt")

if(process.env.HELLO) {
    console.log(process.env.HELLO)
}

if(args.help) {
    printHelp();
}
else if(args.in || args._.includes('-')) {
    let tooLong = CAF.timeout(3, 'Took to long')

    processFile(tooLong, process.stdin)
}
else if(args.file) {
    let tooLong = CAF.timeout(23, 'Took to long')
    let stream = fs.createReadStream(path.join(BASE_PATH, args.file))
    processFile(tooLong, stream).then(() => {
        console.log('complete')
    }).catch((err) => console.error(err))
}else {
    error('Incorrect usage', true)
}

function *processFile(signal, inStream) {
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

    signal.pr.catch(function () {
        outStream.unpipe(targetStream)
        outStream.destroy()
    })

    yield streamComplete(outStream)
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if(includeHelp) printHelp();
}
function printHelp() {
    console.log('ex3 usage')
    console.log('ex3.js --help')
    console.log('')
    console.log('--help         print this help')
    console.log("--in,          process stdin")
    console.log("--out,         print to stdout")
    console.log("--compress     gzip to output")
    console.log("--decompress   decompress file")
    console.log('')
};
