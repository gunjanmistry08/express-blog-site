require('dotenv').config()

const express = require('express');
const expressLayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')
const session = require('express-session');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers')

const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();

app.use(express.static('public'))

app.use(expressLayout)
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
    secret: 'Son Gohan',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI  
    })
}))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.set('layout','./layout/main')
app.set('view engine','ejs')

app.use('/', require('./server/routes/main'))

app.locals.isActiveRoute = isActiveRoute
app.use('/',require('./server/routes/admin'))


app.listen(PORT,() => {
    console.log(`App listening on port ${PORT}`);
})