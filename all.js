const fs = require('fs');
const spawn = require('cross-spawn');
const serial = require('promise-serial');

const ignored = ['node_modules', '.git'];

const dirs = fs.readdirSync(__dirname).filter(f => ignored.indexOf(f) === -1 && fs.statSync(`${__dirname}/${f}`).isDirectory());

const subCommands = dirs.map((dirname, idx) => () => new Promise((resolve, reject) => {
    try {
        console.log(`running ${process.argv.slice(3).join(' ')} on ${dirname}`)
        process.chdir(idx > 0 ? `../${dirname}` : dirname);
        const start = spawn(process.argv[3], process.argv.slice(4), { stdio: 'inherit' });
        start.on('close', (code) => {
            console.log(`child process for ${dirname} exited with code ${code}`);
            resolve();
        });
        if(process.argv[2] === 'parallely') {
            resolve();
        }
    }
    catch(e) {
        reject(e);
    }
}));

serial(subCommands).catch(e => console.log(e));