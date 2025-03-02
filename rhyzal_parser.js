const yaml = require('js-yaml');
const { send_message, send_attachment } = require('./signal_api');


function parseRhyzal(yaml_script, step) {

    try {
        const {script} = yaml.load(yaml_script);
        const send = script[step].send;
        for (let i = 0; i < send.length; i++) {
            if (send[i].startsWith("attach")) {
                const file = send[i].match(/attach\(([^)]+)\)/)[1];
                send_attachment(file);
            } else {
                send_message(script[step].send[i]);
            }
        }
    } catch (e) {
        throw new Error('Invalid yaml input');
        return null;
    }

}

module.exports = parseRhyzal;