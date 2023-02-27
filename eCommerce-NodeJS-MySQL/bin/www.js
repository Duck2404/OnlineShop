#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('webProject:server');
var http = require('http');

/**
 * Nhận từ cổng môi trường lưu trũ trong express
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Tạo máy chỉ HTTP
 */

var server = http.createServer(app);

/**
 * Cổng dc cuung cap trên tất cả các mạng 
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Chuẩn hóa một cổng thành một số, chuỗi hoặc sai.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // tên pipe
        return val;
    }

    if (port >= 0) {
        // Số cổng
        return port;
    }

    return false;
}

/**
 * 
Trình xử lý sự kiện cho sự kiện "lỗi" của máy chủ HTTP.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // sửa lý các lỗi nghe cụ thể
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Trình xử lý sự kiện cho sự kiện "lắng nghe" máy chủ HTTP.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
