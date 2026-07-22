const app = require("./app");
const { connectDB } = require("./config/database.config");
const { PORT, FRONTEND_URL } = require("./config/env.config");

const http = require("http");
const { Server } = require("socket.io");

// 1. create http server từ express app
const server = http.createServer(app);

// 2. init socket.io trên server
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// 3. attach socket handlers
require("./socket/index")(io);

// 4. connect DB
connectDB();

// 5. start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});