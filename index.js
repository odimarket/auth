const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();

require('dotenv').config();

// bodyParser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * All auth routes
 */
app.get('/', (req, res) => res.send('Auth API'));
app.use('/user', require('./routes/users.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/product', require('./routes/products.route'));
app.use('/client', require('./routes/clients.route'));
app.use('/group', require('./routes/groups.route'));
app.use('/role', require('./routes/roles.route'));
app.use('/scope', require('./routes/scopes.route'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
