'use-strict';
const ffmpeg = 'ffmpeg';
const ffprobe = 'ffprobe';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
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
        const result = await this.executeNative(command);
        return result;
    }

    async v2mts(payload) {
        const command = `${ffmpeg} -i ${payload.from} -q 0 ${payload.to}`;
        const result = await this.executeNative(command);
        return result;
    }

    async v2mp4(payload) {
        const command = `${ffmpeg} -i ${payload.from} -c:v copy -c:a aac ${payload.to}`;
        const result = await this.executeNative(command);
        return result;
    }

    async genlist(payload) {
        const command = `for f in ${payload.from}; do echo "file '$f'" >> ${payload.to}; done`;
        const result = await this.executeNative(command);
        return result;
    }

    async concat(payload) {
        const command = `${ffmpeg} -f concat -i ${payload.from} -c copy ${payload.to}`;
        const result = await this.executeNative(command);
        return result;
    }

    async fprobe(payload) {
        const command = `${ffmpeg} -i ${payload.from}`;
        const result = await this.executeNative(command);
        return result;
    }

    async probe(payload) {
        const command = `${ffprobe} -i ${payload.from}`;
        const result = await this.executeNative(command);
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
        const result = await this.executeNative(command);
        return result;
    }

    async executeNative(commandString) {
        Log.info('VideoHandler');

        const { stdout, stderr } = await exec(commandString);
        let result = { stdout, stderr, success: true };

        if (stderr) {
            Log.error(`error: ${stderr}`);
            result.success = false;
        }

        Log.debug(`${stdout}`);
        return result;
    }
}

module.exports = VideoHandler;