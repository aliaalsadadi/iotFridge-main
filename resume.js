const { spawn } = require('child_process');
const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./items.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});


function runPythonScript() {
    const pythonFile = 'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\qrcode_reader.py';
    const pythonProcess = spawn('python', [pythonFile]);

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
        console.error(`Error in Python script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
}

module.exports = runPythonScript;