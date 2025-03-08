import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StreamApp from './StreamApp';
import SSEApp from './SSEApp';
import AxiosStreamApp from './AxiosStreamApp';

function App() {
  return (
    <div style={containerStyle}>
      <nav style={navStyle}>
        <Link to="/stream" style={linkStyle}>Stream Demo</Link>
        <Link to="/sse" style={linkStyle}>SSE Demo</Link>
        <Link to="/axios-stream" style={linkStyle}>Axios Stream Demo</Link>
      </nav>
      
      <Routes>
        <Route path="/stream" element={<StreamApp />} />
        <Route path="/sse" element={<SSEApp />} />
        <Route path="/axios-stream" element={<AxiosStreamApp />} />
        <Route path="/" element={<div style={welcomeStyle}>
          <h1>欢迎使用实时数据演示</h1>
          <p>请选择上方的演示模式：</p>
          <ul>
            <li>Stream - 使用 Fetch API 的流式传输演示</li>
            <li>SSE - 使用 Server-Sent Events 的演示</li>
            <li>Axios Stream - 使用 Axios 的流式传输演示</li>
          </ul>
        </div>} />
      </Routes>
    </div>
  );
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
};

const navStyle = {
  backgroundColor: '#f0f2f5',
  padding: '16px',
  marginBottom: '20px',
  borderRadius: '8px',
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
};

const linkStyle = {
  color: '#1890ff',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  transition: 'background-color 0.3s',
  ':hover': {
    backgroundColor: '#e6f7ff',
  },
};

const welcomeStyle = {
  textAlign: 'center',
  padding: '40px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

export default App; 