const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const file = require('./postgresController');
const connectionPoint = require('./connection.js').connectionPoint;
const bodyParser = require('body-parser');
const loginController = require('./loginController.js');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/dist', express.static(path.join(__dirname, '../dist')));
app.use(cookieParser());

// CHAOS FLOW

app.use((req, res, next) => {
  console.log(
    `***************************************************************************************
    CHAOS FLOW TEST --- METHOD:${req.method}, PATH: ${
      req.url
    }, BODY: ${JSON.stringify(req.body)}
    ***************************************************************************************`
  );
  return next();
});

app.get('/', function(req, res) {
  res.status(200).sendFile(path.resolve(__dirname, '../index.html'));
});

app.post('/server/signup', loginController.signup, (req, res) => {
  return res.status(200).json('Successful Signup!');
});

app.post('/server/login', loginController.login, (req, res) => {
  console.log(res.locals.id);
  return res
    .status(200)
    .cookie('SSID', res.locals.SSID, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true
    })
    .json(res.locals.uriHistory);
});

app.post(
  '/server/tablenames',
  loginController.addURI,
  connectionPoint.createConnection,
  file.getTableNames,
  (req, res) => {
    console.log('res.locals');
    console.log(res.locals);
    return res
      .status(200)
      .json({
        tableName: res.locals.tableName,
        uriHistory: res.locals.uriHistory
      });
  }
);

app.post(
  '/server/table',
  connectionPoint.createConnection,
  file.getData,
  (req, res) => {
    return res.status(200).json(res.locals.info);
  }
);

app.post(
  '/server/update',
  connectionPoint.createConnection,
  file.update,
  (req, res) => {
    return res.status(200).json(res.locals.new);
  }
);

app.post(
  '/server/create',
  connectionPoint.createConnection,
  file.create,
  (req, res) => {
    return res.status(200).json(res.locals.create);
  }
);

app.delete(
  '/server/delete',
  connectionPoint.createConnection,
  file.delete,
  (req, res) => {
    return res.status(200).json(res.locals.delete);
  }
);

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' }
  };
  const errorObj = { ...defaultErr, ...err };
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});

module.exports = app;
