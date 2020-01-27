const express = require('express');
var app = express();
var path = require('path');
var parser = require('body-parser');
const port = process.env.PORT || 3000;


app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('', function (req, res, next) {
    res.locals.userValue = null;
    next();
})

app.get('/', function (req, res) {
    res.render('index', {
        topicHead: 'Student Form',
    });
    console.log('user accessing index page');
});
app.post('/student/add', function (req, res) {
    var student = {
        first: req.body.fname,
        last: req.body.lname
    }
    console.log(student);
    res.render('index', {
        userValue: student,
        topicHead: 'Student Form'
    });

});
 
app.listen(port, () => console.log(`Listening on port ${port}`));
