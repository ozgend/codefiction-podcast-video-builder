'use-strict';

// coloring: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const ConsoleColor = {
    'default': '\x1b[0m',// default + reset coloring
    'debug': '\x1b[44m', // blue
    'info': '\x1b[32m',  // green
    'warn': '\x1b[33m',  // yellow 
    'error': '\x1b[31m'  // red
};

var Log = {

    pretty: false,

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
            // eslint-disable-next-line no-console
            console.log(line, message.trim());
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log('level err +[' + level + ']+\n%s', err);
        }
    }
};

module.exports = Log;