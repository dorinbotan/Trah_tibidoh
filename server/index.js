#!/usr/bin/nodejs
'use strict'

var WebSocketServer = require('websocket').server;
var http = require('http');

var clients = [];

var server = http.Server((req, res) => {
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
    case 'POST':
      if(JSON.parse(postData).url) {
        console.log(JSON.parse(postData).url);

        for(var client in clients) {
          clients[client].sendUTF(JSON.stringify({ instruction: 'REDIRECT', url: JSON.parse(postData).url }));
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

var wsServer = new WebSocketServer({ httpServer: server });
wsServer.on('request', (request) => {
  var connection = request.accept(null, request.origin);
  clients.push(connection);

  console.log(clients.length);
});
