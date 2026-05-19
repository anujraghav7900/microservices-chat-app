const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");

dotenv.config();

const app = express();


// CONNECT DATABASE
connectDB();


// MIDDLEWARE
app.use(cors());

app.use(express.json());


// ROUTES
app.use("/api/auth", require("./src/routes/authRoutes"));

app.use("/api/users", require("./src/routes/userRoutes"));

app.use("/api/chats", require("./src/routes/chatRoutes"));

app.use("/api/messages", require("./src/routes/messageRoutes"));


// HOME ROUTE
app.get("/", (req, res) => {

    res.send("Real Time Chat API Running");
});


// 404 HANDLER
app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });
});


// CREATE HTTP SERVER
const server = http.createServer(app);


// SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


// SOCKET CONNECTION
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);


    // JOIN CHAT ROOM
    socket.on("joinChat", (chatId) => {

        socket.join(chatId);

        console.log(`Joined Chat: ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {

        socket.leave(chatId);
    });


    // SEND MESSAGE
    socket.on("sendMessage", (messageData) => {

        io.to(messageData.chatId).emit(
            "receiveMessage",
            messageData
        );
    });


    // DISCONNECT
    socket.on("disconnect", () => {

        console.log("User Disconnected");
    });
});


// PORT
const PORT = process.env.PORT || 5001;


// START SERVER
server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});
