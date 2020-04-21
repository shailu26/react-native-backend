class Socket {
    constructor(server, app) {
        this.socketIds = {};
        this.listenIO(server, app);
        this.users = {};
        this.io = {};
    }

    listenIO(server, app) {
        // Configuring Socket
        this.io = require("socket.io")(server);
        //listen on every connection
        this.io.on('connection', (socket) => {
            app.set('socket', socket);
            console.log('Socket is Connected!!! ', socket.id);
            // this event will be fired from front end.
            // meaning it will store the connected socket id's user id and
            socket.on('socketDetails', (data) => {
                // adding connected socket id to socketIds object
                this.socketIds[data['socketId']] = data;
                this.users[data['userId']] = data;
                console.log('socketDetails Set');
                socket.emit(`${data.userId}_socketDetailsEmit`);
            });

            socket.on('disconnect', () => {
                console.log('socket ->', socket.id, ' is Disconnected!!');
                if (this.socketIds[socket.id]) {
                    delete this.users[this.socketIds[socket.id].userId];
                    delete this.socketIds[socket.id];
                }
            });
        })
    }
}

module.exports = Socket;