const { spawn } = require('child_process');

function get_items() {
    return new Promise((resolve, reject) => {
        const pythonFile = 'get_items.py';
        const pythonProcess = spawn('python', [pythonFile]);

        let outputData = [];

        pythonProcess.stdout.on('data', (data) => {
            const dataString = data.toString('utf8');
            const dataArray = eval(dataString); // Using eval to parse the array directly
            outputData = outputData.concat(dataArray);
        });

        pythonProcess.stdout.on('end', () => {
            resolve(outputData);
        });

        pythonProcess.on('error', (error) => {
            reject(error);
        });
    });
}
module.exports = get_items;
