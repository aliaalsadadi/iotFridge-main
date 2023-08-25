const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./items.db');
function delete_items() {
    db.run('DELETE FROM items');
}
db.close();
