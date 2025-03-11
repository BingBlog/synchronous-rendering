import React, { useEffect, useState, useRef } from 'react';

function SSEApp() {
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const currentSectionRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const connectSSE = () => {
      try {
        setConnectionStatus('connecting');
        
        // Create new EventSource connection
        eventSourceRef.current = new EventSource('http://localhost:7002/api/sse', {
          withCredentials: true
        });

        // Handle successful connection
        eventSourceRef.current.onopen = () => {
          setConnectionStatus('connected');
          console.log('SSE Connection established');
        };

        // Handle connection error
        eventSourceRef.current.onerror = (error) => {
          console.error('SSE Error:', error);
          setConnectionStatus('error');
        };

        // Handle incoming messages
        eventSourceRef.current.onmessage = (event) => {
          try {
            const newData = JSON.parse(event.data);
            console.log('Received SSE data:', newData);

            // If it's a completion event, don't update data
            if (newData.status === 'analysis_complete') {
              console.log('Analysis complete:', newData);
              return;
            }

            // Check if section has changed
            if (newData.section && newData.section !== currentSectionRef.current) {
              setContent(prev => `${prev}\n\n<strong>${newData.section}</strong>\n`);
              currentSectionRef.current = newData.section;
            }

            // Append new content
            if (newData.words) {
              setContent(prev => prev + newData.words.join(''));
              setWordCount(prev => prev + 1);
            }

            if (newData.progress) {
              setProgress(newData.progress);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        // Handle specific events if needed
        eventSourceRef.current.addEventListener('connected', (event) => {
          const data = JSON.parse(event.data);
          console.log('Connected event:', data);
        });

      } catch (error) {
        console.error('SSE Connection Error:', error);
        setConnectionStatus('error');
      }
    };

    connectSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const renderMessage = () => {
    if (!content) return null;
    return (
      <div style={messageContainerStyle}>
        <div style={messageBubbleStyle}>
          <div style={messageHeaderStyle}>
            数据分析结果 (SSE)
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
        <h1 style={{ margin: 0, fontSize: '18px' }}>实时数据助手 (SSE)</h1>
        <div style={{ 
          fontSize: '14px',
          color: connectionStatus === 'connected' ? '#52c41a' : '#ff4d4f'
        }}>
          {connectionStatus === 'connected' ? '在线' : '连接中...'}
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

export default SSEApp; 