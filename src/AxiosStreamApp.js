import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function AxiosStreamApp() {
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const currentSectionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const previousResponseLengthRef = useRef(0);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setConnectionStatus('connecting');
        abortControllerRef.current = new AbortController();
        
        // Reset content and references
        setContent('');
        previousResponseLengthRef.current = 0;
        currentSectionRef.current = null;

        const response = await axios({
          method: 'get',
          url: 'http://localhost:7001/api/stream',
          responseType: 'stream',
          withCredentials: true,
          signal: abortControllerRef.current.signal,
          onDownloadProgress: (progressEvent) => {
            const chunk = progressEvent.event.target.response;
            if (chunk) {
              
              // Get only the new part of the response
              const newContent = chunk.substring(previousResponseLengthRef.current);
              previousResponseLengthRef.current = chunk.length;
              
              // Only process if we have new content
              if (newContent.trim()) {
                // Split the new content by newlines to handle multiple JSON objects
                const lines = newContent.split('\n').filter(line => line.trim());
                
                console.log('New lines to process:', lines);
                
                lines.forEach(line => {
                  try {
                    const newData = JSON.parse(line);
                    console.log('Received data:', newData);

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
                      console.log('newData.words:', newData.words);
                      setContent(prev => prev + newData.words.join(''));
                      setWordCount(prev => prev + newData.words.length);
                    }

                    if (newData.progress) {
                      setProgress(newData.progress);
                    }
                  } catch (error) {
                    console.error('Error parsing JSON:', error);
                  }
                });
              }
            }
          },
        });

        setConnectionStatus('connected');
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled');
        } else {
          console.error('Stream Error:', error);
          setConnectionStatus('error');
        }
      }
    };

    fetchStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const renderMessage = () => {
    if (!content) return null;
    return (
      <div style={messageContainerStyle}>
        <div style={messageBubbleStyle}>
          <div style={messageHeaderStyle}>
            数据分析结果 (Axios Stream)
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
        <h1 style={{ margin: 0, fontSize: '18px' }}>实时数据助手 (Axios Stream)</h1>
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

export default AxiosStreamApp; 