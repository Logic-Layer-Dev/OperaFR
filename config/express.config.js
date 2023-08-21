const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.set('trust proxy', true);
app.use(cors({
    origin: ['http://localhost'],
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
    headers: ['*']
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({
    extended: true
})); 
app.use(express.static('public'));

module.exports = app;