#!/usr/bin/nodejs
'use strict'

const WebSocketServer = require('websocket').server;
const http = require('https');
const fs = require("fs");

const LETSCRYPT = '/etc/letsencrypt/live/www.dorinbotan.com/';

var options = { 
  key: fs.readFileSync(LETSCRYPT + 'privkey.pem').toString(), 
  cert: fs.readFileSync(LETSCRYPT + 'cert.pem').toString() 
};

var clients = [];

var server = http.Server(options, (req, res) => {
  let jsonString = '';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Server', 'NodeJS');
  
  req.on('data', (data) => {
    jsonString += data;
  }).on('end', () => {
    define(req, res, jsonString);
  });
}); 
server.listen(8080, '172.17.58.117', () => {
  console.log('Listening on port 8080');
});

function define(req, res, postData) {
  switch(req.method) {
    case 'OPTIONS':
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      break;

    case 'POST':
      if(JSON.parse(postData).url) {
        console.log(JSON.parse(postData).url);

        for(var client in clients) {
          clients[client].sendUTF(JSON.stringify({ 
            instruction: 'REDIRECT', 
            url: JSON.parse(postData).url 
          }));
        }
      } else {
        res.statusCode = 400;
      }
      res.end();
      break;

    default:
      res.statusCode = 404;
      res.end();
  }
}

var wssServer = new WebSocketServer({ httpServer: server });
wssServer.on('request', (request) => {
  var connection = request.accept(null, request.origin);
  clients.push(connection);

  console.log(clients.length);
});
