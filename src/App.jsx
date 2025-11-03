import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./frontend/Start";
import Login from "./frontend/Login";
import Codepage from "./frontend/Codepage";
import Python from "./frontend/python";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/codepage" element={<Codepage />} />
        <Route path="/python" element={<Python />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
