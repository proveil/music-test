import { useState } from "react";
import FloatingCircles from "./components/FloatingCircles";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
function App() {
  return (
    <div className="text-white min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 ">
      <FloatingCircles color="bg-green-500" size="w-64 h-64 sm:w-32 sm:h-32" top="-5%" left="10%" delay={0} />
      <FloatingCircles color="bg-emerald-500" size="w-48 h-48 sm:w-24 sm:h-24" top="70%" left="80%" delay={5} />
      <FloatingCircles color="bg-lime-500" size="w-32 h-32 sm:w-16 sm:h-16" top="40%" left="-10%" delay={2} />
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>

    </div>
  )
}

export default App
