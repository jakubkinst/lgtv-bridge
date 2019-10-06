"use strict";
var ping = require('ping');

const URL = require('url');
const LGTV = require('lgtv2');

function init(command, arg) {
    const tv = LGTV({
        url: 'ws://' + process.env.TV_IP + ':3000',
        reconnect: 1000
    });
    tv.on('connect', function () {
        console.log('connected');

        tv.subscribe('ssap://audio/getVolume', function (err, res) {
            if (res.changed.indexOf('volume') !== -1) console.log('volume changed', res.volume);
            if (res.changed.indexOf('muted') !== -1) console.log('mute changed', res.muted);
        });

        // notify power status
        if (process.env.POWER_ON_CALLBACK) {
            console.log("Notifying POWER STATUS ON");
            request(process.env.POWER_ON_CALLBACK, {json: true}, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                console.log(body.url);
                console.log(body.explanation);
            });
        }
    });

    if (checkMacAddress() && checkIPAddress())
        bridgeAPIservice();
}

function checkMacAddress() {
    if (process.env.TV_MAC === null) {
        console.error('\nInvalid or not specified MAC address for your device in TV_MAC environment variable\n');
        return false;
    }
    return true;
}

function checkIPAddress() {
    if (process.env.TV_IP === null) {
        console.error('\nInvalid or not specified IP address for your device in TV_IP environment variable\n');
        return false;
    }
    return true;
}

function bridgeAPIservice() {
    console.log('Starting bridge API service...');
    var http = require('http');
    var port = parseInt(process.env.SERVICE_PORT);
    var s = http.createServer();
    s.on('request', function (request, response) {

        response.write('<a href="http://localhost:' + port + '/command?c=audio/volumeUp">volume up</a><br/>')
        response.write('<a href="http://localhost:' + port + '/command?c=audio/volumeDown">volume down</a><br/>')
        response.write('<a href="http://localhost:' + port + '/command?c=system/turnOn">on</a><br/>')
        response.write('<a href="http://localhost:' + port + '/command?c=system/turnOff">off</a><br/>')

        var url = URL.parse(request.url, true);
        switch (url.pathname) {
            case '/command':
                const command = url.query.c;
                console.log('Request: Custom command: ' + command);
                delete url.query.c;
                executeCommand(command, url.query, (err, res) => {
                    if (err) {
                        console.error('Error:' + err);
                        response.write('Error:' + err)
                    } else {
                        console.log('Success');
                        response.write('Success');
                    }
                    response.end();
                });
                break;
            default:
                response.end();
                break;
        }

    });

    s.listen(port);
    //console.log('\nBrowse to http://container_ip:' + port);
    console.log('Service started, listening on port ' + port);
    console.log('\nUse the following URLS:');
    console.log('http://localhost:' + port + '/command?c=[command]');

    console.log('-----------------------------------------------------\n');

}

function executeCommand(command, params, callback) {
    if (command==='system/turnOn'){
        turnOn(callback);
    } else {
        const tv = LGTV({
            url: 'ws://' + process.env.TV_IP + ':3000'
        });
        tv.on('connect', function () {
            tv.request('ssap://' + command, params, callback);
        });
    }
}


function turnOn(callback) {
    require("node-wol").wake(process.env.TV_MAC,{}, callback);
}

init(process.argv[2], process.argv[3]);

