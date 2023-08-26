const YAML = require('yamljs');
const yaml = require('js-yaml');
const fs = require('fs');
function updateYaml(new_class) {
    try {
        const classes_path = 'classes.txt';
        fs.appendFile(classes_path, ('\n' + new_class), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        const config_path = 'config.yaml';
        let config = YAML.load(config_path);

        let labels = Object.keys(config.names);
        const Max = Math.max(...labels.map(Number));
        let new_label = Max + 1;
        config.names[new_label] = new_class;
        let config_yaml = yaml.dump(config);
        config_yaml = config_yaml.replace(/'(\d+)':/g, '$1:');
        config_yaml = config_yaml.replace(/'([^']+)':/g, '$1');
        fs.writeFileSync(config_path, config_yaml, 'utf8');
        console.log('success');
    } catch (e) {
        console.log(e);
    }
}
exports.updateYaml = updateYaml;