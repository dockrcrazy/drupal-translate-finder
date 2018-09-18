const find = require("find-in-files");
const PO = require('pofile');
const fileFinder = require("find");

async function getTranslationStrings(){
    return await find.findSync("(->t\\((\"|')(.)+)(\"|')\\)", process.argv[2]);
}

function getMsgIds() {
    return new Promise((resolve, reject) => {
        fileFinder.file(/\.po$/, process.argv[2], function(files) {
            let filePromises = [];
            for(let file of files){
                filePromises.push(new Promise((resolveLoad) => {
                    PO.load(file, (err, po) => {
                        let msgIds = [];
                        for(let item of po.items){
                            msgIds.push(item.msgid);
                        }
                        resolveLoad(msgIds);
                    });
                }));
            }
            Promise.all(filePromises).then((promisesResults) => {
                let res = [];
                for(let result of promisesResults){
                    res = res.concat(result);
                }
                resolve(res);
            }, reject);
        });
    });
}

function findUnavailableTranslations(files, msgIds){

    return new Promise((resolve)=>{
        let unavailableTrans = [];
        for (let found in files) {
            let trans = files[found];
            // console.log(`Found ${res.count} files in "${result}"`);
            for(let match of trans.matches){
                if(msgIds.indexOf(match) === -1){
                    unavailableTrans.push({
                        file: found,
                        msg: match
                    });
                }
            }
            console.log(trans);
            // console.log(trans.matches[0])
        }
        resolve(unavailableTrans);
    });
}

async function main() {
    let msgIds = await getMsgIds();
    // console.log(msgIds);
    let translationStrings = await getTranslationStrings();
    let unavailableTrans = await findUnavailableTranslations(translationStrings, msgIds);
    console.log(unavailableTrans);

}
main();

