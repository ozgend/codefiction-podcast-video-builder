'use-strict';
const ffmpeg = 'ffmpeg';
const ffprobe = 'ffprobe';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').exec;
const Log = require('./log');

class VideoHandler {

    constructor(context) {
        this._context = context;
    }

    async extract(payload) {
        const startSeconds = payload.begin.asTotalSecods();
        const endSeconds = payload.end.asTotalSecods();
        const lengthSeconds = endSeconds - startSeconds;
        const lengthTimeMarker = lengthSeconds.asTimeMarker();
        const command = `${ffmpeg} -ss ${payload.begin} -i ${payload.from} -t ${lengthTimeMarker} -vcodec copy -acodec copy ${payload.to}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async v2mts(payload) {
        const command = `${ffmpeg} -i ${payload.from} -q 0 ${payload.to}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async v2mp4(payload) {
        const command = `${ffmpeg} -i ${payload.from} -c:v copy -c:a aac ${payload.to}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async genlist(payload) {
        let result = {
            directory: path.dirname(payload.from),
            extension: path.extname(payload.from),
            success: true
        };

        result.files = fs.readdirSync(result.directory, 'utf8');

        if (result.extension) {
            result.files = result.files.filter(f => f.toLocaleLowerCase().indexOf(result.extension.toLocaleLowerCase()) > 0);
        }

        const content = result.files.map(f => `file '${result.directory}${path.sep}${f.toLocaleLowerCase()}'`).join('\n');
        fs.writeFileSync(payload.to, content, { encoding: 'utf8', flag: 'w' });

        return result;
    }

    async concat(payload) {
        const command = `${ffmpeg} -f concat -safe 0 -i ${payload.from} -c copy ${payload.to}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async fprobe(payload) {
        const command = `${ffmpeg} -i ${payload.from}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async probe(payload) {
        const command = `${ffprobe} -i ${payload.from}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async specs(payload) {
        const data = await this.info(payload);
        const result = JSON.parse(data.stdout);
        return {
            width: result.streams[0].width,
            height: result.streams[0].height,
            fps: result.streams[0].r_frame_rate,
            video: `${result.streams[0].codec_name} / ${result.streams[0].codec_long_name}`,
            audio: `${result.streams[1].codec_name} / ${result.streams[1].codec_long_name}`,
            duration: result.format.duration,
            size: result.format.size
        };
    }

    async info(payload) {
        const command = `${ffprobe} -v quiet -print_format json -show_format -show_streams ${payload.from}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async unwrapped(payload) {
        const command = `${ffmpeg} ${payload.from}`;
        const result = await this.executeNative(command, payload);
        return result;
    }

    async executeNative(commandString, payload) {
        Log.debug('.executeNative.');

        // -- buffered + promise
        // return new Promise(function (resolve) {
        //     const task = spawn(commandString);
        //     let result = { stdout: '', stderr: '', success: true };

        //     task.stdout.on('data', (data) => {
        //         Log.info(`  ${payload.command}  ${data}`);
        //         result.stdout += data;
        //     });

        //     task.stderr.on('data', (data) => {
        //         result.stderr += data;
        //         Log.error(`  ${payload.command}  ${data}`);
        //     });

        //     task.on('close', (code) => {
        //         result.success = result.stderr.length > 0;
        //         result.code = code;
        //         resolve(result);
        //     });

        //     task.on('error', (err) => {
        //         result.err = err;
        //         resolve(result);
        //     });
        // });

        // -- unbuffered + async
        const { stdout, stderr } = await exec(commandString);
        let result = { stdout, stderr, success: true };

        if (stderr) {
            result.success = false;
        }

        return result;
    }
}

module.exports = VideoHandler;