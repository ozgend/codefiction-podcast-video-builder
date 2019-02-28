'use-strict';

const minimist = require('minimist');
const commandExists = require('command-exists').sync;
const fs = require('fs');
const Log = require('./log');
const secondMultipliers = [3600, 60, 1];

String.prototype.asTotalSecods = function () {
    const parts = this.split(':');
    let seconds = 0;

    for (let index = 0; index < parts.length; index++) {
        seconds += parts[index] * secondMultipliers[index];
    }

    return seconds;
}

Number.prototype.asTimeMarker = function () {
    return new Date(this * 1000).toISOString().substr(11, 8);
}

var Init = {
    setup: function (appName) {
        const args = Init._getArgs();
        const env = (process.env.NODE_ENV || 'development').toLocaleLowerCase();
        const ffmpeg = commandExists('ffmpeg');
        const ffprobe = commandExists('ffprobe');

        Log.info('[' + appName + ']');
        Log.info('- NODE_ENV ', env);
        Log.info('- PID ', process.pid);
        Log.info('- ffmpeg ', ffmpeg);
        Log.info('- ffprobe ', ffprobe);

        let context = {
            appName,
            env,
            ffmpeg: ffmpeg,
            ffprobe: ffprobe,
            pid: process.pid,
            step: 'init',
            payloads: [],
            results: []
        };

        if (args && Object.keys(args).length > 0) {

            if (args.steps && fs.existsSync(args.steps)) {
                const stepsContent = fs.readFileSync(args.steps, 'utf8');
                const eol = stepsContent.indexOf('\r\n') > 0 ? '\r\n' : '\n';
                const steps = stepsContent.split(eol);

                context.payloads = steps.map(s => {
                    const parse = s.split('|').map(s => s.trim());

                    let payload = {
                        command: parse[0],
                        from: parse[1]
                    };

                    if (parse.length > 2) {
                        payload.to = parse[2];
                    }

                    if (parse.length > 3) {
                        payload.begin = parse[3];
                        payload.end = parse[4];
                    }

                    return payload;
                });
            }
            else {
                context.payloads = [args];
            }
        }

        return context;
    },

    _getArgs: function () {
        const args = minimist(process.argv.slice(2));
        delete args['_'];
        return args;
    }
};

module.exports = Init;