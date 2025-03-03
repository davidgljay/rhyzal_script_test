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
                - regex(var1, 'foo')
            then:
                user_status: 2
                set_profile:
                    name: user_name
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

    describe('constructor', () => {
        it('should throw an error for invalid input', () => {
            const invalid = `
    invalid_yaml: {{ action }} message {{ message_type }}
            `;
            expect(() => new RhyzalParser(invalid)).toThrowError(/^Invalid yaml input/);
        });
    });

    describe('send', () => {
        it('should throw an error if the script is not initialized', () => {
            const parser = new RhyzalParser('stuff and things');
            expect(() => parser.send(0, {})).toThrow('Script not initialized');
        });

        it('should throw an error if the step is missing from the script', () => {
            const parser = new RhyzalParser(test_yaml);
            expect(() => parser.send(2, {})).toThrow('Step missing from script');
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

    });

    describe ('receive', () => {
        it('should throw an error if the script is not initialized', () => {
            const parser = new RhyzalParser('stuff and things');
            expect(() => parser.receive(0, {})).toThrow('Script not initialized');
        });

        it('should throw an error if the step is missing from the script', () => {
            const parser = new RhyzalParser(test_yaml);
            expect(() => parser.send(2, {})).toThrow('Step missing from script');
        });

   

        it('should update a user\'s status on receive', () => {
            const parser = new RhyzalParser(test_yaml);
            parser.receive(1, {user_id: 1});
            expect(graphql.set_user_status).toHaveBeenCalledWith(1, 'completed');
        });

        // it ('should update a user\'s status based on a condition', () => {
        //     const parser = new RhyzalParser(test_yaml);
        //     parser.receive(0, {user_id: 1, var1: 'foo', time_since_last_message: 20000});
        //     expect(graphql.set_user_status).toHaveBeenCalledWith(1, 2);
        // })

    });

    describe ('evaluate_receive', () => {
        it('should set the user status', () => {
            const parser = new RhyzalParser(test_yaml);
            parser.evaluate_receive({user_status: 2}, {user_id: 1});
            expect(graphql.set_user_status).toHaveBeenCalledWith(1, 2);
        });
    });

    describe ('evaluate_condition', () => {
        it('should properly evaluate a regex match between a variable and a regex', () => {
            const parser = new RhyzalParser(test_yaml);
            expect(parser.evaluate_condition('regex(var1, /foo/)', {var1: 'foo'})).toBe(true);
            expect(parser.evaluate_condition('regex(var1, /foo/)', {var1: 'bar'})).toBe(false);            
        });

        it('should properly evaluate a regex match between two variables', () => {
            const parser = new RhyzalParser(test_yaml);
            expect(parser.evaluate_condition('regex(var1, var2)', {var1: 'foo', var2: 'foo'})).toBe(true);
            expect(parser.evaluate_condition('regex(var1, var2)', {var1: 'foo', var2: 'bar'})).toBe(false);
        });

        it('should properly evaluate a variable', () => {
            const parser = new RhyzalParser(test_yaml);
            expect(parser.evaluate_condition('var1', {var1: true})).toBe(true);
            expect(parser.evaluate_condition('var1', {var1: false})).toBe(false);
            expect(parser.evaluate_condition('var1', {var1: 1})).toBe(true);
            expect(parser.evaluate_condition('var1', {var1: 0})).toBe(false);
        });
    });

});