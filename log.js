/* eslint-disable no-console */
'use-strict';

// coloring: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const ConsoleColor = {
    'default': '\x1b[0m',// default + reset coloring
    'debug': '\x1b[44m', // blue
    'info': '\x1b[32m',  // green
    'warn': '\x1b[33m',  // yellow 
    'error': '\x1b[31m'  // red
};

const _timers = {};

var Log = {

    pretty: false,

    progress: function (progressMessage) {
        if (process.stdout.clearLine) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(progressMessage);
        }
    },

    getTimer: function (uid) {
        if (!_timers[uid]) {
            _timers[uid] = new Date();
        }

        return ((Date.now() - _timers[uid]) / 1000);
    },

    endTimer: function (uid) {
        let time = 0;
        if (_timers[uid]) {
            time = _timers[uid];
            delete _timers[uid];
        }
        return time;
    },

    log: function (...logArgs) {
        Log.write('default', logArgs);
    },

    debug: function (...logArgs) {
        Log.write('debug', logArgs);
    },

    info: function (...logArgs) {
        Log.write('info', logArgs);
    },

    warn: function (...logArgs) {
        Log.write('warn', logArgs);
    },

    error: function (...logArgs) {
        Log.write('error', logArgs);
    },

    table: function (arg) {
        console.table(arg);
    },

    write: function (level, ...logArgsSpanner) {
        try {
            const logArgs = logArgsSpanner[0];
            let message = '';
            for (let index = 0; index < logArgs.length; index++) {
                const arg = logArgs[index];
                if (typeof (arg) == 'object') {
                    message += JSON.stringify(arg, null, Log.pretty ? 2 : 0);
                }
                else {
                    message += arg;
                }
                message += ' ';
            }
            const line = ConsoleColor[level] + '%s' + ConsoleColor['default'];
            console.log(line, message.trim());
        }
        catch (err) {
            console.log('level err +[' + level + ']+\n%s', err);
        }
    }
};

module.exports = Log;