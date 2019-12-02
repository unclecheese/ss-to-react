#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const ComponentFile = require('./ComponentFile');

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
    throw new Error(`Destination path ${destPath} does not exist`);
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

glob(`${sourcePath}/**/*.ss`, (err, files) => {
    const promises = files.map(f => {
        const pathname = path.relative(sourcePath, f);
        return read(path.join(sourcePath, pathname))
            .then(contents => { 
            	const file = new ComponentFile(destPath, pathname, contents);
                return file.persist();
            })
            .catch(console.error)
    });

    Promise.all(promises);
});