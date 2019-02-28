'use-strict';

const Init = require('./init');
const Log = require('./log');
const VideoHandler = require('./video-handler');
const App = {};

let progressPid = -1;

Log.pretty = true;

App.init = async function () {
    const context = Init.setup('cf-video-ci');
    Log.debug('context:', context);
    Log.table(context.payloads.map(p => { return { command: p.command, from: p.from }; }));

    if (!context.payloads || context.payloads.length == 0) {
        Log.error('- payload not set');
        App.exit();
    }

    if (!context.ffmpeg) {
        Log.error('- ffmpeg not found');
        App.exit();
    }

    Log.getTimer(context.appName);

    return context;
}

App.ready = async function (context) {
    Log.warn('++ App.ready ++');
    return context;
}

App.run = async function (context) {
    Log.warn('++ App.run ++');

    const videoHandler = new VideoHandler(context);
    let payload;
    let progressUid;

    progressPid = setInterval(() => {
        if (!payload) {
            Log.progress('++ Preparing ++');
        }
        else {
            progressUid = `iup_${payload.command}`;
            let commandTime = Log.getTimer(progressUid).toFixed(2);
            let appTime = Log.getTimer(context.appName).toFixed(2);
            Log.progress(`++ App.running ${appTime} secs. || command ${commandTime} secs :: [${payload.command}: ${payload.from}] ++`);
        }
    }, 100);

    for (let index = 0; index < context.payloads.length; index++) {
        payload = context.payloads[index];
        const commandFn = videoHandler[payload.command] ? videoHandler[payload.command].bind(videoHandler) : false;
        let result = -1;

        if (!commandFn) {
            Log.error(`command not supported [${payload.command}]`);
        }
        else {
            result = await commandFn(payload);
            Log.debug('command: ', payload.command);
            //Log.info('result: ', result);
        }

        result.runtime = Log.getTimer(progressUid).toFixed(2);
        result.command = payload.command;
        context.results.push(result);
        
        Log.endTimer(progressUid);
    }

    return context;
}

App.done = async function (context) {
    Log.warn('++ App.done ++');
    context.results.map(Log.debug);
    return context;
}

App.exit = function (context) {
    if (!context) {
        process.exit(-1);
    }
    clearInterval(progressPid);

    const elapsed = context.results.map(r => { return { command: r.command, runtime: `${r.runtime} secs` }; });
    Log.table(elapsed);

    var errors = context.results.filter(r => r.success == false) || [];
    process.exit(errors.length)
}

App.init()
    .then(App.ready)
    .then(App.run)
    .then(App.done)
    .then(App.exit);

module.exports = App;