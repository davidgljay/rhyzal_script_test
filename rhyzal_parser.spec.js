const SignalApi = require('./signal_api');

jest.mock('./signal_api', () => ({
    send_message: jest.fn(),
    send_attachment: jest.fn()
}));

const parse = require('./rhyzal_parser');


describe('rhyzal_parser', () => {

    const test_yaml = `
script:
    0:
        variables:
            var1: function(var)
            var2: set(user.name)
        send:
            message: Message with {{var1}} to {{var2}}!
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
        SignalApi.send_message('Not the right message')

        parse(test_yaml, 1);
        expect(SignalApi.send_message).toHaveBeenCalledWith(message1);
        expect(SignalApi.send_message).toHaveBeenCalledWith(message2);
        expect(SignalApi.send_attachment).toHaveBeenCalledWith('filevar');
    });

    it('should throw an error for invalid input', () => {
        const input = 'invalid yaml input';
        expect(() => parse(input)).toThrow('Invalid yaml input');
    });

  // Add more test cases as needed
});