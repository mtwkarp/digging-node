"use strict";

var fetch = require("node-fetch");


// ************************************

const HTTP_PORT = 8039;


main().catch(() => 1);


// ************************************

async function main() {
    console.log(' i run man')
    try {
        let res = await fetch('http://localhost:8039/get-records')
        if(res && res.ok) {
            let records = await res.json()

            if (records && records.length > 0) {
                console.log(records)
                process.exitCode = 0
                return
            }
        }
    }catch (e) {
        console.log(e)
    }



    process.exitCode = 1
}
