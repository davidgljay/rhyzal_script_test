const yaml = require('js-yaml');
const { send_message, send_attachment } = require('./signal_api');


function parseRhyzal(yaml_script, step) {

    try {
        const {script} = yaml.load(yaml_script);
        switch (script[step]) {
            case 'send':
                for (let i = 0; i < script[step].send.length; i++) {
                    if (script[step].send[0].startsWith("attach")) {
                        send_attachment(script[step].send[i]);
                    } else {
                        send_message(script[step].send[i]);
                    }
                }
                break;
            case 'attachment':
                send_attachment(script[step].send.attachment);
                break;
            default:
                for (let i = 0; i < script[step].send.length; i++) {
                    console.log(script[step].send[i]);
                }
        }
        for (let i = 0; i < script.length; i++) {
            console.log(script[i]);
        }
    } catch (e) {
        console.log(e);
        return null;
    }

}

module.exports = parseRhyzal;