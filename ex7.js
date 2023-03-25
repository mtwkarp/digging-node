#!/usr/bin/env node

"use strict";

var util = require("util");
var childProc = require("child_process");
const {del, all} = require("express/lib/application");


// ************************************

const HTTP_PORT = 8039;
const MAX_CHILDREN = 5;

var delay = util.promisify(setTimeout);


main().catch(console.error);


// ************************************

async function main() {
	// // console.log(`Load testing http://localhost:${HTTP_PORT}...`);

    while (true) {
        process.stdout.write(`Trying ${MAX_CHILDREN} requests ...`)
        let funcs = []
        let finished = 0
        let allSuccess =  true

        for (let i = 0; i < MAX_CHILDREN; i++) {
            var child = childProc.spawn('node', ['ex7-child.js'])
            var o = util.promisify(child.on).bind(child)
            var f = util.promisify(function (code) {
                // console.log('code')
                if(code === 0) {
                    allSuccess = true
                }else {
                    allSuccess = false
                }

                finished ++
            })

            const result = await o('exit')


            console.log(result)
        }

        await Promise.all(funcs)
            .then((values) => {
                if(allSuccess && finished === MAX_CHILDREN) {
                    // console.log('success')

                }else {
                    // console.log('fail')
                    // console.log('Finished num: ', finished)
                    // console.log('All success: ', allSuccess)
                }
            })


        await delay(1000)
    }
}

