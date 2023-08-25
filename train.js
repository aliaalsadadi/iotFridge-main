const { spawn } = require('child_process');
function
    train() {
    const pythonScriptPath = 'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\resume.py';
    const pythonScript = spawn('python', [pythonScriptPath]);

    pythonScript.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
    });

    pythonScript.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
    });

    pythonScript.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
};
module.exports = train;