require("dotenv").config();
const express = require("express");

const http = require("http");

const cors = require("cors");

const { Server } = require("socket.io");



const connectDB = require("./src/config/db");



// ROUTES

// const chatRoutes = require("./src/routes/chatRoutes");

// const messageRoutes = require("./src/routes/messageRoutes");



const app = express();



/* MIDDLEWARE */

app.use(cors());

app.use(express.json());



/* DATABASE */

connectDB();



/* ROUTES */

// app.use("/api/chats", chatRoutes);

// app.use("/api/messages", messageRoutes);



/* TEST ROUTE */

app.get("/", (req, res) => {

    res.send("Chat Service Running");
});



/* HTTP SERVER */

const server = http.createServer(app);



/* SOCKET SERVER */

const io = new Server(server, {

    cors: {

        origin: "http://localhost:5173",

        methods: ["GET", "POST"]
    }
});


const onlineUsers = new Map();

const getOnlineUsers = () =>
    Array.from(onlineUsers.keys());



/* SOCKET CONNECTION */

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);


    socket.on("registerUser", (userId) => {

        if (!userId) {
            return;
        }

        if (socket.userId === userId) {
            io.emit("onlineUsers", getOnlineUsers());
            return;
        }

        if (socket.userId && onlineUsers.has(socket.userId)) {
            const currentCount = onlineUsers.get(socket.userId);

            if (currentCount <= 1) {
                onlineUsers.delete(socket.userId);
            } else {
                onlineUsers.set(
                    socket.userId,
                    currentCount - 1
                );
            }
        }

        socket.userId = userId;
        socket.join(`USER_${userId}`);
        onlineUsers.set(
            userId,
            (onlineUsers.get(userId) || 0) + 1
        );

        io.emit("onlineUsers", getOnlineUsers());

        console.log("Registered User Room:", userId);
    });



    /* JOIN CHAT ROOM */

    socket.on("joinChat", (chatId) => {

        socket.join(chatId);

        console.log("Joined Chat:", chatId);
    });

    socket.on("leaveChat", (chatId) => {

        socket.leave(chatId);
    });


    socket.on("typing", (data) => {

        if (!data || !data.chatId) {
            return;
        }

        socket.to(data.chatId).emit(
            "typing",
            data
        );

        if (data.receiverUserId) {
            io.to(`USER_${data.receiverUserId}`).emit(
                "typing",
                data
            );
        }
    });



    /* SEND MESSAGE */

    socket.on("sendMessage", (data) => {

        if (!data || !data.chatId) {
            return;
        }

        io.to(data.chatId).emit(
            "receiveMessage",
            data
        );

        if (Array.isArray(data.receiverUserIds)) {
            data.receiverUserIds.forEach((userId) => {
                io.to(`USER_${userId}`).emit(
                    "receiveMessage",
                    data
                );
            });
        }
    });



    /* DISCONNECT */

    socket.on("disconnect", () => {

        if (socket.userId && onlineUsers.has(socket.userId)) {
            const currentCount = onlineUsers.get(socket.userId);

            if (currentCount <= 1) {
                onlineUsers.delete(socket.userId);
            } else {
                onlineUsers.set(
                    socket.userId,
                    currentCount - 1
                );
            }

            io.emit("onlineUsers", getOnlineUsers());
        }

        console.log("User Disconnected");
    });
});



/* PORT */

const PORT = process.env.PORT || 5001;



/* START SERVER */

server.listen(PORT, () => {

    console.log(
        `Chat Service running on ${PORT}`
    );
});
