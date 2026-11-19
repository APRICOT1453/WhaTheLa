const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Vercel'den gelecek bağlantılara izin veriyoruz
const io = new Server(server, {
  cors: {
    origin: "*", // Güvenlik için canlıya alınca Vercel linkini yazabilirsin
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Kullanıcı bağlandı: ${socket.id}`);

  // Odaya katılma
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  // Mesaj gönderme ve diğerlerine iletme
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

// Render'ın atadığı portu veya 3001'i kullan
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WhaTheLa Sunucusu ${PORT} portunda çalışıyor...`);
});
