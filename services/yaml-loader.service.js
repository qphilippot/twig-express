const yaml = require('js-yaml');
const fs   = require('fs');

class YamlLoaderService {
    static load(filePath) {
        try {
            return yaml.load(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = YamlLoaderService;
