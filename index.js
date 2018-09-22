const find = require("find-in-files");
const PO = require('pofile');
const fileFinder = require("find");
const colors = require('colors/safe');
const path = require('path');

async function getFilesContainingTranslations() {
    let filesContainingTrans = [];
    let files = await find.findSync("(->t\\((\"|')(.)+)(\"|')\\)", process.argv[2]);
    for (let found in files) {
        let trans = files[found];
        let transfile = {
            filePath: found,
            trans: []
        };
        for (let match of trans.matches) {
            transfile.trans.push(match.match(/->t\(["']((.)+)["']\)/)[1]);
        }
        filesContainingTrans.push(transfile);
    }
    return filesContainingTrans;
}

function getPoFiles() {
    return new Promise((resolve, reject) => {
        fileFinder.file(/\.po$/, process.argv[2], function (files) {
            let filePromises = [];
            for (let file of files) {
                filePromises.push(new Promise((resolveLoad) => {
                    PO.load(file, (err, po) => {
                        let poFile = {
                            filePath: file,
                            msgIds: [],
                        };
                        for (let item of po.items) {
                            poFile.msgIds.push(item.msgid);
                        }
                        resolveLoad(poFile);
                    });
                }));
            }
            Promise.all(filePromises).then((promisesResults) => {
                let res = [];
                for (let result of promisesResults) {
                    res = res.concat(result);
                }
                resolve(res);
            }, reject);
        });
    });
}

function scanTranslations(transFiles, poFiles) {
    return new Promise((resolve) => {
        let result = [];
        for (let transFile of transFiles) {
            let scannedFile = {
                filePath: transFile.filePath,
                wellTranslated: [],
                trans: [],
            };
            for (let translation of transFile.trans) {
                let trans = {
                    msg: translation,
                    foundIn: []
                };
                for (let poFile of poFiles) {
                    for (let msgId of poFile.msgIds) {
                        if (msgId === translation) {
                            trans.foundIn.push(poFile.filePath);
                        }
                    }
                }
                if (trans.foundIn.length === poFiles.length) {
                    scannedFile.wellTranslated.push(trans);
                }
                scannedFile.trans.push(trans);
            }

            result.push(scannedFile)
        }
        resolve(result);
    });
}

async function main() {
    let poFiles = await getPoFiles();
    let transFiles = await getFilesContainingTranslations();
    let translations = await scanTranslations(transFiles, poFiles);
    echoResult(translations, poFiles);

}

function echoResult(translations, poFiles) {

    console.log(colors.blue('Po files found: '));
    for (let file of poFiles) {
        console.log(`- ${path.basename(file.filePath)} ${colors.grey('(' + file.filePath + ')')}`)
    }
    console.log(colors.blue('Translations found: '));
    for (let translation of translations) {
        console.log(`${path.basename(translation.filePath)} [${translation.wellTranslated.length}/${translation.trans.length}] ${colors.grey('(' + translation.filePath + ')')}`);
        for (let trans of translation.trans) {
            let text = `  - ${trans.msg} [${trans.foundIn.length}/${poFiles.length}]`;
            if (trans.foundIn.length === 0) {
                text = colors.red(text);
            }
            if (trans.foundIn.length > 0 && trans.foundIn.length < poFiles.length) {
                text = colors.yellow(text);
                let pathList = '';
                for (let poFile of trans.foundIn) {
                    pathList += path.basename(poFile) + ','
                }
                pathList = pathList.substr(0, pathList.length - 1);
                text = text + colors.grey(` (${pathList})`);

            }
            if (trans.foundIn.length === poFiles.length) {
                text = colors.green(text);
            }
            console.log(text);
        }
    }
}

main();

