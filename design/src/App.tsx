/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProgressBar from './components/ProgressBar';
import Navbar from './components/Navbar';
import RobotArm3D from './components/RobotArm3D';
import Hero from './components/Hero';
import Features from './components/Features';
import Process from './components/Process';
import Demo from './components/Demo';
// import Chat from './components/Chat';
import Architecture from './components/Architecture';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="bg-black min-h-screen text-[#f5f5f5] font-body selection:bg-brand-orange selection:text-black overflow-x-hidden">
      <ProgressBar />
      <Navbar />
      {isHome && <RobotArm3D />}
      
      <main className="relative z-30 pointer-events-none">
        <Routes>
          <Route path="/" element={<><Hero /><Features /><Process /></>} />
          <Route path="/demo" element={<Demo />} />
          {/* <Route path="/chat" element={<Chat />} /> */}
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
