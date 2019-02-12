let express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    dialgoflow = require('dialogflow');
    usernames = [];

app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


io.sockets.on('connection', (socket) => {
    console.log('Connected');

    //New User
    socket.on('new user', (data, cb) => {
        if(usernames.indexOf(data) !== -1) {
            cb(false)
        }else{
            cb(true)
            socket.username = data;
            usernames.push(socket.username);
            
            socket.emit('new message', {msg: `Hello ${socket.username}`, user: 'Chat Bot'});
            socket.broadcast.emit('new message', {msg: `${socket.username} has Joined the conversation`, user: 'Chat Bot'})
            
            updateUsernames();
        }
    })
    
    updateUsernames = () => {
        io.sockets.emit('usernames', usernames )
    }
    //Send message
    socket.on('message', (data)=>{
        io.sockets.emit('new message', {msg: data, user: socket.username})
    })

    socket.on('disconnect', (data) => {
        console.log("Socket Disconnect", data)
        if(!socket.username){
            return;
        }
        io.sockets.emit('new message', {msg: `${socket.username} has left the conversation`, user: 'Chat Bot'})
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
    })
})

server.listen(6502, () => {
    console.log("Server Running on 6502")
})
