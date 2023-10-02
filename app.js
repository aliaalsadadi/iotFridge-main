const express = require('express');
const updateyml = require('./update_yaml.js')
const axios = require('axios');
const mongo = require('./mongo.js');
const get_grocery = require('./get_grocery.js');
const wbm = require('wbm');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const nunjucks = require('nunjucks');
const get_images = require('./camera.js');
const get_items = require('./get_items.js')
const train = require('./train.js');
const get_recipe = require('./recipe.js');
const app = express();
const path = require('path');
let router = express.Router()
const { spawn } = require('child_process');
const { title } = require('process');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());
nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.get('/', async function (req, res, next) {
    // mongo().then((door) => {
    //     res.render('index.njk', door);
    // })
    res.render('index.njk');
});
app.get("/learn", function (req, res) {
    res.render('learn.njk');
});
app.post('/learn', async (req, res) => {
    updateyml.updateYaml(req.body.new_class);
    await get_images.get_images();
    res.redirect('/upload');
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
    res.render('train.njk');
});
app.post("/train", (req, res) => {
    train();
    res.redirect('/');
});
app.get('/get-fridge', async (req, res) => {
    let url = 'http://192.168.188.200/capture';
    await axios.get(url, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(`try.jpg`, Buffer.from(response.data, 'binary'));
        });
    get_items()
        .then((items) => {
            console.log(items);
            res.render('result.njk', { items: items });
        })
        .catch((error) => {
            console.error(error);
        });
});
// app.get('/test/:id', (req, res) => {
//     let url = 'http://192.168.188.200/capture';
//     axios.get(url, { responseType: 'arraybuffer' })
//         .then(response => {
//             fs.writeFileSync(`try.jpg`, Buffer.from(response.data, 'binary'));
//         });
//     let number = req.params.id;
//     send_list(number);
// });
app.get('/grocery', async (req, res) => {
    let url = 'http://192.168.188.200/capture';
    await axios.get(url, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(`try.jpg`, Buffer.from(response.data, 'binary'));
        });
    get_grocery().then((groceries) => {
        res.render("grocery.njk", { groceries: groceries });
    });
})
app.post('/grocery', async (req, res) => {
    let id = req.body[0];
    let item = req.body[1];
    let quantity = req.body[2];
    let action = req.body[3];
    if (!item || !quantity) {
        console.log("No item or quantity");
    } else {
        if (action == "Add") {
            let db = new sqlite3.Database('./groceries.db', (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                db.run(`INSERT INTO groceries (item, quantity) VALUES(?,?)`, item, quantity, function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            });
        } else if (action == "Remove") {
            let db = new sqlite3.Database('./groceries.db', (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                db.run(`DELETE FROM groceries WHERE id = ?`, id, function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            });
        }
    }
});
app.get('/recipes', async (req, res) => {
    let url = 'http://192.168.188.200/capture';
    await axios.get(url, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(`try.jpg`, Buffer.from(response.data, 'binary'));
        });
    let allmeals = [];
    await get_recipe()
        .then((meals) => {
            allmeals = meals;
        })
        .catch((error) => {
            console.error(error);
        });

    res.render("recipe.njk", { meals: allmeals });
});
var port = 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
