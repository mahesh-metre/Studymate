import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./frontend/Start";
import Login from "./frontend/Login";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
