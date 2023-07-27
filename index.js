const io = require('socket.io')(8800, {
    cors: {
        origin: "http://localhost:3000",
    },
})


let activeUsers = []

io.on('connection', (socket) => {

    // add new user
    socket.on('new-user-add', (newUserId) => {

        // if new user is not already added
        if (!activeUsers.some(user => user === newUserId)) {
            activeUsers.push({ userId: newUserId, socketId: socket.id })
            console.log('new user added', activeUsers);
        }

        io.emit('get-users', activeUsers)

    })


    // send real time messages
    socket.on('send-message', (message) => {

        const { receiverId } = message

        const user = activeUsers.find(user => user.userId === receiverId)

        if (user) {
            io.to(user.socketId).emit('receive-message', message)
        }

    })


    // disconnect user
    socket.on("disconnect", () => {

        // remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);

        // send all active users to all users
        io.emit("get-users", activeUsers);

    });

})