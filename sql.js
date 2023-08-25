const sqlite3 = require('sqlite3');
const YAML = require('yamljs');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const config_path = 'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\config.yaml';
let config = YAML.load(config_path);
function delete_items() {
    let db = new sqlite3.Database('./items.db', (err) => {
        if (err) {
            console.error(err.message);
            reject(err);
        }
        db.run('DELETE FROM items');
    });
}
function get_items() {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./items.db', (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }

            let sql1 = `SELECT DISTINCT item_id FROM items`;
            let ids = [];
            db.all(sql1, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                rows.forEach((row) => {
                    ids.unshift(row.item_id);
                });

                let sql = `SELECT COUNT(item_id) AS count
          FROM items
          WHERE item_id = ?`;
                let items = [];
                let counter = 0;

                function executeQuery(i) {
                    if (i === ids.length) {
                        resolve(items);
                        return;
                    }
                    db.all(sql, ids[i], (err, rows) => {
                        if (err) {
                            reject(err);
                        }
                        items.push([rows[0].count, ids[i]]);
                        counter++;
                        if (counter === ids.length) {
                            resolve(items);
                        } else {
                            executeQuery(counter);
                        }
                    });
                }

                executeQuery(0);
            });

            db.close();
        });
    });
}
function runPythonScript() {
    return new Promise((resolve, reject) => {
        const pythonFile = 'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\qrcode_reader.py';
        const pythonProcess = spawn('python', [pythonFile]);
        let db = new sqlite3.Database('./items.db', (err) => {
            if (err) {
                console.error(err.message);
            }
        });
        pythonProcess.stdout.on('data', (data) => {
            ids = data.toString('utf8');
            ids = ids.split("\n");
            for (let i = 0; i < ids.length; i++) {
                id = parseInt(ids[i]);
                if (isNaN(id)) {
                    continue;
                }
                db.run(`INSERT INTO items (item_id) VALUES(?)`, id, function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
            resolve();
        });
    });
}

function returner(callback) {
    get_items()
        .then((items) => {
            for (let i = 0; i < items.length; i++) {
                for (const key in config.names) {
                    if (key == items[i][1]) {
                        items[i][1] = config.names[key];
                    }
                }
            }
            callback(items);
        })
        .catch((err) => {
            console.error(err);
        });
};
async function execute() {
    await runPythonScript();
    const items = await get_items();
    for (let i = 0; i < items.length; i++) {
        for (const key in config.names) {
            if (key == items[i][1]) {
                items[i][1] = config.names[key];
            }
        }
    }
    console.log(items);
    delete_items();
    return items;
}
module.exports = execute;