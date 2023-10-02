const axios = require('axios');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3');


function get_recipe() {
    return new Promise((resolve, reject) => {
        const pythonFile = 'recipe.py';
        const pythonProcess = spawn('python', [pythonFile]);
        pythonProcess.stdout.on('data', (data) => {
            let ids = [];
            let output = data.toString('utf8');
            output = output.split('\n');
            for (let i = 0; i < output.length; i++) {
                if (output[i] === '') {
                    continue;
                }
                ids.push(parseInt(output[i]));
            }
            let placeholders = ids.map((id) => '?').join(',');
            let sql = `SELECT name FROM record WHERE id IN (${placeholders})`;

            let db = new sqlite3.Database('./groceries.db', (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                db.all(sql, ids, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    const promises = rows.map((row) => {
                        return new Promise((resolve, reject) => {
                            let ingredient = row.name;
                            const options = {
                                method: 'GET',
                                url: `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`,
                            };

                            axios
                                .request(options)
                                .then((response) => {
                                    let meals = response.data.meals;
                                    resolve(meals);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    reject(error);
                                });
                        });
                    });

                    Promise.all(promises)
                        .then((results) => {
                            const meals = results.reduce((acc, meal) => {
                                if (meal) {
                                    acc.push(...meal);
                                }
                                return acc;
                            }, []);
                            console.log(meals);
                            resolve(meals);
                        })
                        .catch((error) => {
                            console.error(error);
                            reject(error);
                        });
                });
            });
        });
    });
}
module.exports = get_recipe;