import React, { useState } from 'react';

export default function Base64Tool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
    } catch (err) {
      setError('编码失败：' + err.message);
      setOutputText('');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
    } catch (err) {
      setError('解码失败：输入的不是有效的 Base64 字符串');
      setOutputText('');
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError('请输入内容');
      return;
    }
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  // 显示 toast 提示
  const showCopyToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      showCopyToast('✓ 已复制到剪贴板');
    } catch (err) {
      showCopyToast('✗ 复制失败');
    }
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: '#fff',
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
        }}>
          Base64 编解码
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
          margin: 0,
        }}>
          支持文本与 Base64 字符串的相互转换
        </p>
      </header>

      {/* 模式切换 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => {
            setMode('encode');
            setError('');
            setOutputText('');
          }}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: mode === 'encode' ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: mode === 'encode'
              ? 'rgba(99, 102, 241, 0.15)'
              : 'rgba(255,255,255,0.03)',
            color: mode === 'encode' ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          🔒 编码（文本 → Base64）
        </button>
        <button
          onClick={() => {
            setMode('decode');
            setError('');
            setOutputText('');
          }}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: mode === 'decode' ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: mode === 'decode'
              ? 'rgba(99, 102, 241, 0.15)'
              : 'rgba(255,255,255,0.03)',
            color: mode === 'decode' ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          🔓 解码（Base64 → 文本）
        </button>
      </div>

      {/* 输入输出区域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '20px',
        marginBottom: '24px',
        alignItems: 'start',
      }}>
        {/* 输入区域 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              color: '#fff',
              margin: 0,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#f59e0b',
                borderRadius: '50%',
              }}></span>
              {mode === 'encode' ? '原始文本' : 'Base64 字符串'}
            </h3>
            {inputText && (
              <span style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.85rem',
              }}>
                {inputText.length} 字符
              </span>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError('');
            }}
            placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的 Base64 字符串...'}
            style={{
              width: '100%',
              minHeight: '300px',
              background: 'rgba(0,0,0,0.3)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: "'Consolas', 'Monaco', monospace",
              resize: 'vertical',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* 中间操作按钮 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '40px',
        }}>
          <button
            onClick={handleSwap}
            disabled={!outputText}
            title="交换输入输出"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              cursor: outputText ? 'pointer' : 'not-allowed',
              background: outputText
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(255,255,255,0.05)',
              color: outputText ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⇄
          </button>
        </div>

        {/* 输出区域 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              color: '#fff',
              margin: 0,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: outputText ? '#10b981' : 'rgba(255,255,255,0.3)',
                borderRadius: '50%',
              }}></span>
              {mode === 'encode' ? 'Base64 结果' : '解码结果'}
            </h3>
            {outputText && (
              <span style={{
                color: '#10b981',
                fontSize: '0.85rem',
                fontWeight: '500',
              }}>
                {outputText.length} 字符
              </span>
            )}
          </div>
          <div style={{
            width: '100%',
            minHeight: '300px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '16px',
            color: outputText ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '0.9rem',
            fontFamily: "'Consolas', 'Monaco', monospace",
            lineHeight: '1.6',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
          }}>
            {outputText || '转换结果将显示在这里...'}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: '#fca5a5',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleConvert}
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            transition: 'all 0.2s ease',
          }}
        >
          {mode === 'encode' ? '🔒 编码' : '🔓 解码'}
        </button>

        {outputText && (
          <button
            onClick={handleCopy}
            style={{
              padding: '14px 32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              transition: 'all 0.2s ease',
            }}
          >
            📋 复制结果
          </button>
        )}

        <button
          onClick={handleClear}
          style={{
            padding: '14px 24px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          清空
        </button>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease',
        }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
