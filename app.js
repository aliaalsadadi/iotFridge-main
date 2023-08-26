const express = require('express');
const updateyml = require('./update_yaml.js')
const axios = require('axios');
const fs = require('fs');
const get_images = require('./model.js');
const execute = require('./sql.js');
const train = require('./train.js');
const app = express();
const path = require('path');
const { spawn } = require('child_process');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});
app.get("/learn", function (req, res) {
    res.sendFile(path.join(__dirname, './learn.html'));
});
app.post('/learn', async (req, res) => {
    updateyml.updateYaml(req.body.new_class);
    await get_images.get_images();
    res.redirect('/upload');
});
app.post('/upload', (req, res) => {
    res.send('training');
});
app.get('/upload', function (req, res) {
    const pythonProcess = spawn('python', ['cvat.py']);
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.redirect('/train');
        } else {
            res.status(500).send('Error executing Python script');
        }
    });
    pythonProcess.on('error', (error) => {
        res.status(500).send(`Error running Python script: ${error.message}`);
    });
    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        console.error(errorMessage);
    });
});
app.get("/train", (req, res) => {
    res.sendFile(path.join(__dirname, './train.html'));
});
app.post("/train", async (req, res) => {
    await train();
    res.redirect('/');
});
app.get('/get-fridge', (req, res) => {
    let url = 'https://f326-193-188-123-42.ngrok-free.app/capture';
    axios.get(url, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(`try.jpg`, Buffer.from(response.data, 'binary'));
        });
    execute()
        .then(items => {
            let result = '<table style="border-collapse: collapse; width: 100%;">';
            result += '<tr><th style="border: 1px solid black; padding: 8px;">Item</th><th style="border: 1px solid black; padding: 8px;">Quantity</th></tr>';
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    result += `<tr><td style="border: 1px solid black; padding: 8px;">${items[i][1]}</td><td style="border: 1px solid black; padding: 8px;">${items[i][0]}</td></tr>`;
                }
            }
            result += '</table>';
            res.send(result);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('An error occurred');
        });
})
var port = 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));