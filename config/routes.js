const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig');


const { authenticate, generateToken } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

// REGISTER
function register(req, res) {
  // implement user registration
  const register = req.body;

  const hash = bcrypt.hashSync(register.password, 10);
  register.password = hash;

  db('users')
  .insert(register)
  .then( (ids) => {
    db('users')
      .where({ id: ids[0] })
      .first()
      .then( register => {
        const token = generateToken(register);
        res.status(201).json(token);
      });
  })
  .catch(err => {
    res.status(500).json({err});
  });
};

// LOGIN
function login(req, res) {
  // implement user login
  const info = req.body;

  db('users')
    .where({ username: info.username })
    .first()
    .then( (user) => {
      if ( user && bcrypt.compareSync(info.password, user.password)) {
        const token = generateToken(user);
        res.send(token);
      } else {
        return res.status(401).json({ error: "Wrong info" });
      }
    })
    .catch( err => {
      res.status(500).json({ err });
    });
};

// GETJOKES
function getJokes(req, res) {
  console.log('token', req.jwtToken);
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
