
class SignalApi {
    constructor() {
        this.signal = null;
    }

    send_message(message) {
        console.log('Sending message:', message);
    }

    send_attachment(file) {
        console.log('Sending file: ', file);
    }
}

module.exports = SignalApi;