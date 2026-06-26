module.exports = (socket, io) => {
    // Disconnect
    socket.on("disconnect", async (reason) => {
        console.log(
            "User disconnected:",
            socket.user?.userId,
            "Reason:",
            reason
        );
    });

}