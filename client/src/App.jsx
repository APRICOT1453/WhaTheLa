import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Send, MessageSquare, Users } from "lucide-react";
import "./App.css";

const SOCKET_URL = "https://onrender.com";
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("Genel");
  const [joined, setJoined] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", receiveHandler);

    return () => socket.off("receive_message", receiveHandler);
  }, []);

  if (!joined) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img src="url" alt="WhaTheLa.ico">
          <h1>WhaTheLa</h1>
          <p>Hızlı ve Anlık Mesajlaşma</p>
          <input
            type="text"
            placeholder="Adınız..."
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Oda Adı (Örn: Genel)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Sohbete Başla</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sol Menü (WhatsApp Web Tarzı) */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>WhaTheLa</h3>
          <span className="badge">{username}</span>
        </div>
        <div className="room-list">
          <div className="room-item active">
            <Users size={20} />
            <div>
              <h4>#{room} Odası</h4>
              <p>Aktif sohbet kanalı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf (Sohbet Alanı) */}
      <div className="chat-area">
        <div className="chat-header">
          <h4>#{room}</h4>
          <span>Çevrimiçi</span>
        </div>

        <div className="chat-body">
          {messageList.map((msg, index) => {
            const isMe = msg.author === username;
            return (
              <div key={index} className={`message-wrapper ${isMe ? "me" : "other"}`}>
                <div className="message-bubble">
                  {!isMe && <span className="author">{msg.author}</span>}
                  <p>{msg.message}</p>
                  <span className="time">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={currentMessage}
            placeholder="Bir mesaj yazın..."
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
