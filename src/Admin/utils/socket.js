import { io } from "socket.io-client";

// Ganti URL sesuai alamat backend-mu
export const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
});