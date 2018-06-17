"use strict";

const http         = require('http');
const finalhandler = require('finalhandler');
const Router       = require('router');
const bodyParser   = require('body-parser');
const bcrypt       = require('bcrypt');
const urlParser    = require('url');

const router = new Router({mergeParams: true});

router.use(bodyParser.json());

const MSG = () => {
  let messages = [];
  let ID = 1;

  return {
    all: messages,
    last: () => {
      return messages[messages.length -1];
    },
    get: int => {
      return messages.find(msg => msg.id == int);
    },
    create: class Message {
        constructor(msg){
          this.id = ID++;
          this.message = msg.message;
          messages.push(this);
        }
    }
  }
}

let messageBuilder = MSG();

router.get('/', (request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end("Hello, World!");
});

router.post('/message', (request, response) => {
  new messageBuilder.create(request.body);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(`${messageBuilder.last().id}`);
});

router.get('/message/:id', (request, response) => {

  const msg = messageBuilder.get(request.params.id);
  let msgJSON = JSON.stringify(msg);

  if (request.url.includes('encrypt=true')) {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return bcrypt.hash(msgJSON, 10, (err, hashed) => {
      response.end(hashed);
    });
  }

    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(msgJSON);
});

router.get('/messages', (request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(messageBuilder.all));
})



const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

exports.listen = function(port, callback) {
  server.listen(port, callback);
};

exports.close = function(callback) {
  server.close(callback);
};
