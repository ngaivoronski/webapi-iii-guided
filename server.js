const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

// middleware

// custom middleware
function logger(req, res, next) {
  console.log(`${req.method} to ${req.originalUrl}`);
  next(); // allows the request to continue to the next middleware or route handler
}

// write middleware that reads a password from the headers and if the password is 'mellon' let it continue
// if not, send back the status code 401 and a message

function gateKeeper(req, res, next) {
  // read the password
  const password = req.headers.password;

  // is it mellon?
  if(password && password.toLowerCase() === "mellon") {
    next();
  } else {
    res.status(401).json({ message: "wrong password" });
  }

  // next
}

// checkRole('admin') checkRole('agents')
function checkRole(role) {
  return function(req, res, next) {
    if(role && role === req.headers.role) {
      next()
    } else {
      res.status(403).json({ message: "insufficient role" });
    }
  }
}

// use MiddleWare
server.use(helmet());
server.use(express.json());
server.use(logger);

// endpoints
server.use('/api/hubs', helmet(), checkRole('admin'), hubsRouter); // also local middleware, because it only applies to /api/hubs

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.get("/echo", (req, res) => {
  res.send(req.headers);
});

// shift + alt + down to copy the selected lines
server.get("/area51", gateKeeper, checkRole('agent'), (req, res) => {
  res.send(req.headers);
});



module.exports = server;
