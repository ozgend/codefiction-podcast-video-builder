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
        process.exit(-1);
    }

    if (!context.ffmpeg) {
        Log.error('- ffmpeg not found');
        process.exit(-1);
    }

    setInterval(() => {
        Log.progress('++ App.progress X ');
    }, 100);

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

    progressPid = setInterval(() => {
        if (!payload) {
            Log.progress('++ Preparing ++');
        }
        else {
            let time = Log.timer('iup_' + payload.command);
            Log.progress('++ App.progress [[' + payload.command + ']] @ elapsed ' + time + ' secs.  ++');
        }
    }, 100);

    for (let index = 0; index < context.payloads.length; index++) {
        payload = context.payloads[index];
        const commandFn = videoHandler[payload.command] ? videoHandler[payload.command].bind(videoHandler) : false;
        let result = -1;

        if (!commandFn) {
            Log.error('command not supported [' + payload.command + ']');
        }
        else {
            result = await commandFn(payload);
            Log.debug('command: ', payload.command);
            Log.info('result: ', result);
        }

        context.results.push(result);

        Log.timer('iup_' + payload.command, true);
    }

    return context;
}

App.done = async function (context) {
    Log.warn('++ App.done ++');
    context.results.map(Log.debug);
    return context;
}

App.exit = function (context) {
    clearInterval(progressPid);
    var errors = context.results.filter(r => r.success == false) || [];
    process.exit(errors.length)
}

App.init()
    .then(App.ready)
    .then(App.run)
    .then(App.done)
    .then(App.exit);

module.exports = App;