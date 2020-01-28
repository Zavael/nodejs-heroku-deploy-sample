# Node.js sample app deployed to Heroku using GitHub actions

## Creating Node.js simple app

We create a simple [Node.js](https://nodejs.org/) web app with [Ejs templates](https://ejs.co/)

npm and node.js needs to be installed to start develop.

 - `npm init` - creates the default `package.json` file
 - `nom install express path body-parser ejs --save` - installs dependencies for the app

Create `app.js` - entry point of the app. Express is used to create the server and set up the routes and logic.
```js
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

// route to handle get on base url
app.get('/', function (req, res) {
    res.render('index', {
        topicHead: 'Person Form',
    });
    console.log('user accessing index page');
});

// route to handle sending data with POST on base url
app.post('/', function (req, res) {
    var person = {
        first: req.body.fname,
        last: req.body.lname
    }
    console.log(person);
    res.render('index', {
        userValue: person,
        topicHead: 'Person Form'
    });

});

// start the server
app.listen(port, () => console.log(`Listening on port ${port}`));
```

Create index.ejs - homepage handled by ejs to send and show data
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <%- include('header'); %>
</head>
<body>
    <h1><%= topicHead %></h1>
    <form name="form1" method="POST" action="/">
        <table>
            <tr>
                <td>First name</td>
                <td><input type="text" name="fname"></td>
            </tr>
            <tr>
                <td>last name</td>
                <td><input type="text" name="lname"></td>
            </tr>
            <tr>
                <td colspan="2"><input type="submit" value="Save"></td>
            </tr>
        </table>
    </form>
    <% if(userValue!=null){ %>
    <div> Data Entered as <%= userValue.first %> <%= userValue.last %> </div>
    <%}%> 
</body>
<%- include('footer'); %>
</html>
```
Create `header.ejs` and `footer.ejs` or remove the `..include..` parts of `index.ejs`.
 - `npm start` - should run the server localy and listen on `http://localhost:3000/`

## Setting up Dockerfile
To deploy to Heroku using Github actions, image needs to be created.

Create `Dockerfile`
```docker
FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ]
```

Optionaly create `.dockerignore`
```
node_modules
npm-debug.log
```

## Pushing image to heroku

To create a workflow to push the app to heroku you need a Heroku account. Go to Github Actions and create a new workflow.

We trigger it on push on the `master` branch. First we need to login to Heroku - with the Api key. This can be saved in Github repository `Settings -> Secrets`. You can generate the API key with Heroku cli using `heroku authorizations:create`. Then we push it to heroku using the api key again and defining the heroku app name (can be stored in secrets too for removing duplicity). The last step is to order heroku to release it.

```yaml
name: Push to Heroku

on:
  push:
    branches:
      - master

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - name: Login to Heroku
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:login
    - name: Build and push
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:push -a ${{ secrets.HEROKU_APP_NAME }} web
    - name: Release
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:release -a ${{ secrets.HEROKU_APP_NAME }} web
```
You can examne the failures of any step in the github actions screen. If everything worked well, you should have your app deployed on your heroku app website.