'use-strict';

const Init = require('./init');
const Log = require('./log');
const VideoHandler = require('./video-handler');

Log.pretty = true;

const App = {};

App.init = async function () {
    const context = Init.setup('cf-video-ci');
    Log.debug('context:', context);

    if (!context.payloads || context.payloads.length == 0) {
        Log.error('- payload not set');
        process.exit(-1);
    }

    if (!context.ffmpeg) {
        Log.error('- ffmpeg not found');
        process.exit(-1);
    }

    return context;
}

App.ready = async function (context) {
    Log.warn('++ App.ready ++');
    return context;
}

App.run = async function (context) {
    const videoHandler = new VideoHandler(context);

    for (let index = 0; index < context.payloads.length; index++) {
        const payload = context.payloads[index];
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
    }

    return context;
}

App.done = async function (context) {
    Log.warn('++ App.done ++');
    context.results.map(Log.debug);
    return context;
}

App.init().then(App.ready).then(App.run).then(App.done);

module.exports = App;