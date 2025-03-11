import React, { useEffect, useState, useRef } from 'react';

function StreamApp() {
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const currentSectionRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setConnectionStatus('connecting');
        abortControllerRef.current = new AbortController();
        
        const response = await fetch('http://localhost:7002/api/stream', {
          credentials: 'include',
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setConnectionStatus('connected');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // 将新接收的数据添加到buffer中
          buffer += decoder.decode(value, { stream: true });

          // 查找完整的JSON对象
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const jsonString = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            try {
              const newData = JSON.parse(jsonString);
              console.log('Received data:', newData);

              // 如果是完成事件，不更新数据
              if (newData.status === 'analysis_complete') {
                console.log('Analysis complete:', newData);
                continue;
              }

              // 检查section是否发生变化
              if (newData.section && newData.section !== currentSectionRef.current) {
                setContent(prev => `${prev}\n\n<strong>${newData.section}</strong>\n`);
                currentSectionRef.current = newData.section;
              }

              // 追加新内容
              if (newData.words) {
                setContent(prev => prev + newData.words.join(''));
              }
              // 更新字数统计
              setWordCount(prev => prev + 1);

              if (newData.progress) {
                setProgress(newData.progress);
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
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
            数据分析结果
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
        <h1 style={{ margin: 0, fontSize: '18px' }}>实时数据助手 (Stream)</h1>
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

export default StreamApp; 