const yaml = require('js-yaml');


function parseRhyzal(yaml_script) {

    try {
        const obj = yaml.load(yaml_script);
        return obj;
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports = parseRhyzal;