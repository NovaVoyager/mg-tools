import React, { useState, useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export default function URLTool() {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 输入或模式变化时自动转换（派生状态）
  const { outputText, error } = useMemo(() => {
    if (!inputText.trim()) {
      return { outputText: '', error: '' };
    }
    try {
      const result = mode === 'encode'
        ? encodeURIComponent(inputText)
        : decodeURIComponent(inputText);
      return { outputText: result, error: '' };
    } catch (err) {
      return {
        outputText: '',
        error: mode === 'encode'
          ? '编码失败：' + err.message
          : '解码失败：输入的不是有效的 URL 编码字符串',
      };
    }
  }, [inputText, mode]);

  const handleClear = () => {
    setInputText('');
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
    } catch {
      showCopyToast('✗ 复制失败');
    }
  };

  const handleSwap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInputText(outputText);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          URL 编解码
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          支持 URL 参数的编码与解码，输入即时转换，处理特殊字符转义
        </p>
      </header>

      {/* 模式切换 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setMode('encode')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: mode === 'encode' ? `2px solid ${colors.primary}` : `2px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: mode === 'encode' ? colors.primaryBg : colors.cardBg,
            color: mode === 'encode' ? colors.primaryLight : colors.textSecondary,
            transition: 'all 0.2s ease',
          }}
        >
          🔒 编码（文本 → URL）
        </button>
        <button
          onClick={() => setMode('decode')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: mode === 'decode' ? `2px solid ${colors.primary}` : `2px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: mode === 'decode' ? colors.primaryBg : colors.cardBg,
            color: mode === 'decode' ? colors.primaryLight : colors.textSecondary,
            transition: 'all 0.2s ease',
          }}
        >
          🔓 解码（URL → 文本）
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
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              color: colors.textPrimary,
              margin: 0,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.3s ease',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: colors.warning,
                borderRadius: '50%',
              }}></span>
              {mode === 'encode' ? '原始文本' : 'URL 编码字符串'}
            </h3>
            {inputText && (
              <span style={{
                color: colors.textTertiary,
                fontSize: '0.85rem',
                transition: 'color 0.3s ease',
              }}>
                {inputText.length} 字符
              </span>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encode' ? '请输入要编码的文本...\n例如：你好世界 hello world!' : '请输入要解码的 URL 编码字符串...\n例如：%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C%20hello%20world!'}
            style={{
              width: '100%',
              minHeight: '300px',
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              color: colors.textPrimary,
              fontSize: '0.9rem',
              fontFamily: "'Consolas', 'Monaco', monospace",
              resize: 'vertical',
              lineHeight: '1.6',
              transition: 'all 0.3s ease',
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
              background: outputText ? colors.primaryBg : colors.cardBg,
              color: outputText ? colors.primaryLight : colors.textDisabled,
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
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              color: colors.textPrimary,
              margin: 0,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.3s ease',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: outputText ? colors.success : colors.textDisabled,
                borderRadius: '50%',
              }}></span>
              {mode === 'encode' ? 'URL 编码结果' : '解码结果'}
            </h3>
            {outputText && (
              <span style={{
                color: colors.success,
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
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            color: outputText ? colors.textPrimary : colors.textDisabled,
            fontSize: '0.9rem',
            fontFamily: "'Consolas', 'Monaco', monospace",
            lineHeight: '1.6',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
          }}>
            {outputText || '转换结果将显示在这里...'}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: colors.errorText,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
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
              background: colors.gradientSuccess,
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
            border: `1px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: 'transparent',
            color: colors.textSecondary,
            transition: 'all 0.2s ease',
          }}
        >
          清空
        </button>
      </div>

      {/* 使用说明 */}
      <div style={{
        marginTop: '30px',
        background: colors.primaryBg,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${colors.primaryBorder}`,
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          color: colors.primaryLight,
          fontSize: '1rem',
          fontWeight: '600',
          margin: '0 0 12px 0',
          transition: 'color 0.3s ease',
        }}>
          使用说明
        </h3>
        <ul style={{
          color: colors.textSecondary,
          fontSize: '0.85rem',
          lineHeight: '1.8',
          margin: 0,
          paddingLeft: '20px',
          transition: 'color 0.3s ease',
        }}>
          <li>URL 编码：将文本中的特殊字符转换为 %XX 格式，适用于 URL 参数传递</li>
          <li>URL 解码：将 %XX 格式的编码还原为原始文本</li>
          <li>常见应用：处理 URL 参数中的中文、空格、特殊符号等字符</li>
          <li>编码示例：空格 → %20，中文 → %E4%BD%A0%E5%A5%BD，& → %26</li>
          <li>快速复制：点击复制按钮即可复制结果到剪贴板</li>
        </ul>
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
