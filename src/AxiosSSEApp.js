import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function AxiosSSEApp() {
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const currentSectionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const maxRetries = 3;
  const retryDelay = 2000;

  const processChunk = (chunk) => {
    try {
        // console.log('Processing chunk:', chunk);
        // Processing chunk: event: connected
        // data: {"status":"connected"}
        // data: {"section":"数据概览","words":["分","析","用"],"progress":{"currentSection":1,"totalSections":6,"currentWord":3,"totalWords":60}}
        // data: {"section":"数据概览","words":["户","提","供"],"progress":{"currentSection":1,"totalSections":6,"currentWord":6,"totalWords":60}}
     
        // Split the chunk by newlines to handle multiple events
      const lines = chunk.split('\n').filter(line => line.trim());

      const line = lines[lines.length - 1];

      if (line === 'data: {"status":"connected"}') {
        console.log('Received SSE event line:', line);
        setConnectionStatus('connected');
        return;
      }

      if (line.startsWith('data: ')) {
        console.log('Received SSE data line:', line);
        // Remove 'data: ' prefix if it exists
        const jsonStr = line.replace(/^data: /, '');

        const newData = JSON.parse(jsonStr);
        console.log('Received SSE data:', newData);

        if (newData.status === 'analysis_complete') {
            console.log('Analysis complete:', newData);
            return;
        }

        if (newData.section && newData.section !== currentSectionRef.current) {
            setContent(prev => `${prev}\n\n<strong>${newData.section}</strong>\n`);
            currentSectionRef.current = newData.section;
        }

        if (newData.words) {
            setContent(prev => prev + newData.words.join(''));
            setWordCount(prev => prev + 1);
        }

        if (newData.progress) {
            setProgress(newData.progress);
        }
      }
        
    } catch (error) {
      console.error('Error parsing SSE data:', error);
    }
  };

  const connectSSE = async (retryCount = 0) => {
    console.log('connectSSE run');
    // Cancel any existing connection before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setConnectionStatus('connecting');
      
      // Create a new AbortController for this connection
      abortControllerRef.current = new AbortController();

      const response = await axios({
        method: 'GET',
        url: 'http://localhost:7002/api/sse',
        responseType: 'stream',
        withCredentials: true,
        signal: abortControllerRef.current.signal,
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target.response;
          if (chunk) {
            processChunk(chunk);
          }
        },
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        }
      });

      setConnectionStatus('connected');
      console.log('SSE Connection established');

      // Reset retry count on successful connection
      retryCount = 0;

    } catch (error) {
      // Ignore abort errors when component unmounts
      if (axios.isCancel(error)) {
        console.log('SSE Connection canceled:', error.message);
        return;
      }

      console.error('SSE Connection Error:', error);
      setConnectionStatus('error');
    }
  };

  const activeConnectionRef = useRef(null);

  const closeConnection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      activeConnectionRef.current = false;
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    let timeoutId;
    
    // Use a small timeout to ensure only one connection survives
    timeoutId = setTimeout(() => {
      if (!activeConnectionRef.current) {
        activeConnectionRef.current = true;
        connectSSE();
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      activeConnectionRef.current = false;
    };
  }, []);

  const renderMessage = () => {
    if (!content) return null;
    return (
      <div style={messageContainerStyle}>
        <div style={messageBubbleStyle}>
          <div style={messageHeaderStyle}>
            数据分析结果 (Axios SSE)
          </div>
          <div style={messageContentStyle}>
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {progress && (
            <div style={messageTimeStyle}>
              分析进度: {progress.currentSection}/{progress.totalSections} | 已生成字数: {wordCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>实时数据助手 (Axios SSE)</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            fontSize: '14px',
            color: connectionStatus === 'connected' ? '#52c41a' : '#ff4d4f'
          }}>
            {connectionStatus === 'connected' ? '在线' : connectionStatus === 'disconnected' ? '已断开' : '连接中...'}
          </div>
          {connectionStatus === 'connected' && (
            <button 
              onClick={closeConnection}
              style={{
                padding: '4px 12px',
                fontSize: '14px',
                border: '1px solid #ff4d4f',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#ff4d4f',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ff4d4f';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ff4d4f';
              }}
            >
              断开连接
            </button>
          )}
        </div>
      </div>
      
      <div style={chatContainerStyle}>
        {renderMessage()}
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5',
};

const headerStyle = {
  padding: '16px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const chatContainerStyle = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const messageContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
};

const messageBubbleStyle = {
  backgroundColor: '#fff',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '600px',
  animation: 'fadeIn 0.3s ease-in-out',
};

const messageHeaderStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '12px',
};

const messageContentStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333',
  wordBreak: 'break-all',
  marginBottom: '8px',
};

const messageTimeStyle = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'right',
};

export default AxiosSSEApp; 