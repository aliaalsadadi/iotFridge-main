const { spawn } = require('child_process');

function runLabelImg() {
    const labelImgCommand = 'labelImg';
    const labelImgArgs = [
        'images/train',
        'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\classes.txt'
    ]; // Example arguments
    const Args = [
        'images/val',
        'C:\\Users\\HP\\PycharmProjects\\pythonProject1\\yolo\\classes.txt'
    ];
    const labelImgProcess = spawn(labelImgCommand, labelImgArgs);
    const labelImg = spawn(labelImgCommand, Args);
    labelImg.stdout.on('data', (data) => {
        console.log(`LabelImg output: ${data}`);
    });
    labelImg.stderr.on('data', (data) => {
        console.error(`Error in LabelImg: ${data}`);
    });
    labelImg.on('close', (code) => {
        console.log(`LabelImg process exited with code ${code}`);
    });
    labelImgProcess.stdout.on('data', (data) => {
        console.log(`LabelImg output: ${data}`);
    });


    labelImgProcess.stderr.on('data', (data) => {
        console.error(`Error in LabelImg: ${data}`);
    });


    labelImgProcess.on('close', (code) => {
        console.log(`LabelImg process exited with code ${code}`);
    });
}

module.exports = runLabelImg;