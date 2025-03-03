const yaml = require('js-yaml');
const { send_message, send_attachment } = require('./signal_api');


function parseRhyzal(yaml_script, step, vars) {

    try {
        const {script} = yaml.load(yaml_script);
        const send = script[step].send;
        console.log(send);
        for (let i = 0; i < send.length; i++) {
            if (send[i].match(/attach\(([^)]+)\)/)) {
                const file = send[i].match(/attach\(([^)]+)\)/)[1];
                send_attachment(file);
            } else {
                let message = script[step].send[i];
                for (const key in vars) {
                    message = message.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
                }
                send_message(message);
            }
        }
    } catch (e) {
        throw new Error('Invalid yaml input');
        return null;
    }

}

module.exports = parseRhyzal;