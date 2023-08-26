const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/', function (req, res) {
    nunjucks.configure({ autoescape: true });
    let data = nunjucks.renderString('Hello {{ username }}', { username: 'James' });
    res.send(data);
});

var port = 80
app.listen(port, () => console.log(`Server listening on port ${port}`));