import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HeroSection from "./Component/HeroSection";
import InteractiveElement from "./Component/MindMapX";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/mindmap" element={<InteractiveElement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
