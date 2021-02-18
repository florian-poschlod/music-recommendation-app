require('dotenv').config();
require("./database");

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const favicon       = require('serve-favicon');
const hbs           = require('hbs');
const logger        = require('morgan');
const path          = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
const session       = require('express-session');
const MongoStore    = require('connect-mongo')(session)
const mongoose      = require('./database/index');





//


const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

//store sesion using mongo

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
        saveUninitialized: false,
        //Forces the session to be saved back to the session store, 
        // even if the session was never modified during the request.
        resave: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    })
)

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

hbs.registerPartials(__dirname + '/views/partials')



const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});
// console.log('spf api in app.js', spotifyApi);

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// default value for title local
app.locals.title = 'Bandsalat';


// Routes
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/', auth)

const prefs = require('./routes/prefs');
app.use('/', prefs)

const recom = require('./routes/recom');
app.use('/', recom)

const home = require('./routes/home');
app.use('/', home)

const param = require('./routes/param');
app.use('/', param)

module.exports = app;
