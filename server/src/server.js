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
        origin: FRONTEND_URL, // hoặc FRONTEND_URL
        credentials: true,
    },
});

// 3. attach socket handlers (index socket của bạn)
require("./socket/index")(io); 
// require("./socket/socket.subscriber")(io);
// hoặc path bạn đang dùng: ./socket/index

// 4. connect DB
connectDB();

// 5. start server (QUAN TRỌNG: dùng server.listen)
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});