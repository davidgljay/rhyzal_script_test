const SignalApi = require('./signal_api');
const graphql = require('./graphql');

jest.mock('./signal_api', () => ({
    send_message: jest.fn(),
    send_attachment: jest.fn()
}));

jest.mock('./graphql', () => ({
    set_user_status: jest.fn()
}));

const RhyzalParser = require('./rhyzal_parser');


describe('rhyzal_parser', () => {

    const test_yaml = `
script:
    0:
        send:
            - Message with {{var1}} to {{var2}}!
        on_receive:
            if:
                or:
                  - regexmatch
                  - function
                then:
                    user_status: 2
                    set_profile:
                    name: get_name(response)
            else:
                user_status: 3
            default:
                user_status: 4
    1:
        send:
            - Another message with no variables!
            - A second message to be sent a few seconds later.
            - attach(filevar)
        on_receive:
            user_status: completed
`;

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('should send the appropriate message', () => {
        const message1 = 'Another message with no variables!';
        const message2 = 'A second message to be sent a few seconds later.';
        const parser = new RhyzalParser(test_yaml);
        parser.send(1, {});

        expect(SignalApi.send_message).toHaveBeenCalledWith(message1);
        expect(SignalApi.send_message).toHaveBeenCalledWith(message2);
        expect(SignalApi.send_attachment).toHaveBeenCalledWith('filevar');
    });

    it ('should send the appropriate message with variables', () => {
        const message = 'Message with foo to bar!';
        const vars = {var1: 'foo', var2: 'bar'};
        const parser = new RhyzalParser(test_yaml);
        parser.send(0, vars);
        expect(SignalApi.send_message).toHaveBeenCalledWith(message);
    });

    it('should update a user\'s status on receive', () => {
        const parser = new RhyzalParser(test_yaml);
        parser.receive(1, {user_id: 1});
        expect(graphql.set_user_status).toHaveBeenCalledWith(1, 'completed');
    });

    it('should throw an error for invalid input', () => {
        const invalid = `
invalid_yaml: {{ action }} message {{ message_type }}
        `;
        expect(() => new RhyzalParser(invalid)).toThrowError(/^Invalid yaml input/);
        const parser2 = new RhyzalParser(test_yaml);
        expect(() => parser2.send(2, {})).toThrow('Step missing from script');
    });

});