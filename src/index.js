const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage,generateLocationMessage} = require('./utils/messages');
// const { generateLocationMessage } = require('./utils/locationMessage');
const publicDirPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirPath));


//---------------------------------------------------------socket handlers--------------------------------------------------------

io.on('connection',(socket)=>{//establishes a connection to the server with client(one for each client)
    //   it get triggered when ever a client conncet to the server.'connection' event is an inbuilt socketio event
    
    console.log('connection extablished');

   
   
    
    socket.on('join',({username,room},callback) => {
        const {error,user}=addUser({id:socket.id,username,room});
        if(error)
        {
           return callback(error);
        }

        socket.join(user.room);//we are using user.room instead of room because in users room and name are trimmed and converted to lower case

        socket.emit('message',generateMessage('Admin','hello there,welcome to chat room'));//send the message to client when they are connected
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',user.username +' has join the room'));//emits the message to all the client in the room except the client who triggered this emit(i.e,who joined (in theis context))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        
        callback();
    })
    
    socket.on('sendMessage',(message,callback)=>{
        // const filter = new Filter();
         const user = getUser(socket.id);
        // if(filter.isProfane(message))//checks for bad words if present it sends an error message: 'profanity is not allowed'
        // {
        //     return callback(undefined,'profanity,ok and bye messages are not allowed');
        // }
        var filter = new Filter({ placeHolder: '😘'});
        var newBadWords = ['ok', 'K','okey','bye'];
 
        filter.addWords(...newBadWords);
 
        const mes=filter.clean(message);
      

        io.to(user.room).emit('message',generateMessage(user.username,mes));//send the message to all the clients in the room
        callback('Delevered message!! ',undefined); //ackwnolgement 
    });

    socket.on ('sendLocation',(coords,callback)=>{
        const loc='https://google.com/maps?q=' + coords.latitude +','+ coords.longitude;
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,loc));
        callback("Deliverd Location",undefined);//acknowledge the message recived
    }); 

    socket.on('disconnect',()=>{
        const user =removeUser(socket.id);
        if(user){
        io.to(user.room).emit('message',generateMessage(user.username + ' has left'));//we are not using socket.broadcast.emit because as this 'disconnect'
        //is inbuilt event of socketio ,it get triggered when the client disconnect,as he is disconnected he wont recive the message of io.emit
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    }

    })

    
    
});


//---------------------------------------------------------server listener--------------------------------------------
app.get('/', (req,res)=>{
    res.send(index)
});

server.listen(port,()=>{
    console.log('listening on port:', port);
})
