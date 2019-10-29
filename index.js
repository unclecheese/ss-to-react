#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const HTMLtoJSX = require('htmltojsx');

const argv = yargs
    .command('$0 <source> <dest>')
    .help()
    .argv;

const sourcePath = path.resolve(argv.source);
const destPath = path.resolve(argv.dest);

if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source path ${sourcePath} does not exist`);
} 
if (!fs.existsSync(destPath)) {
    throw new Error(`Destination path ${sourcePath} does not exist`);
} 

const read = sourcePath => (
    new Promise((resolve, reject) => {
        fs.readFile(sourcePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    })
);
const write = (target, contents) => (
    new Promise((resolve, reject) => {
        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true});
        }
        fs.writeFile(target, contents, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
);
const converter = new HTMLtoJSX({
    createClass: false,
});                

glob(`${sourcePath}/**/*.ss`, (err, files) => {
    const promises = files.map(f => {
        const pathname = path.relative(sourcePath, f);
        const componentName = path.basename(f, '.ss');
        return read(path.join(sourcePath, pathname))
            .then(contents => { 
                let jsx = contents.replace(/(<%)(.+?)(%>)/g,`<!-- $2 -->`);
                try {
                    jsx = converter.convert(jsx);
                    jsx = jsx.split("\n")
                            .map(line => `\t\t${line}`)
                            .join("\n");
                    jsx = 
`import React from 'react';

const ${componentName} = () => {
    return (
${jsx}
    );
};

export default ${componentName};
`;
                } catch (err) {
                    console.log(contents);
                    return Promise.reject();
                }
                
                return write(path.join(destPath, pathname.replace(/\.ss$/, '.js')), jsx);
            })
            .catch(console.error)
    });

    Promise.all(promises);
});