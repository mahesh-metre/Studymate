import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./frontend/Start";
import Login from "./frontend/Login";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

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
