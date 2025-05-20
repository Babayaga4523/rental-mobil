import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.js"; // tambahkan .js di akhir
import reportWebVitals from "./reportWebVitals.js"; // tambahkan .js di akhir
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
