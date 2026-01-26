import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const HISTORY_STORAGE_KEY = 'mg-tools-calculator-history';

export default function Calculator() {
  const { colors } = useTheme();

  // 核心状态
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [isNewCalculation, setIsNewCalculation] = useState(true);

  // UI 状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeKey, setActiveKey] = useState(null);

  // 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // 保存历史记录到 localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  // Toast 提示
  const showCopyToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // 计算表达式
  const calculateExpression = (expr) => {
    try {
      // 替换显示符号为 JS 运算符
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.()%\s]/g, '');

      // 验证括号匹配
      const openBrackets = (sanitized.match(/\(/g) || []).length;
      const closeBrackets = (sanitized.match(/\)/g) || []).length;
      if (openBrackets !== closeBrackets) {
        return 'Error: 括号不匹配';
      }

      // 使用 Function 构造器计算
      const result = new Function(`return ${sanitized}`)();

      // 验证结果
      if (!isFinite(result)) {
        return 'Error: 无效结果';
      }

      // 格式化结果（保留最多 10 位小数，去除尾部 0）
      return parseFloat(result.toFixed(10)).toString();
    } catch (error) {
      return 'Error: 无效表达式';
    }
  };

  // 添加到历史记录
  const addToHistory = (expr, res) => {
    const newRecord = {
      id: Date.now(),
      expression: expr,
      result: res,
      timestamp: Date.now()
    };

    // 限制历史记录数量（最多保留 50 条）
    const updatedHistory = [newRecord, ...history].slice(0, 50);
    setHistory(updatedHistory);
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    showCopyToast('✓ 历史记录已清空');
  };

  // 点击历史记录恢复
  const handleHistoryItemClick = (item) => {
    setExpression(item.expression);
    setDisplay(item.result);
    setResult(item.result);
    setIsNewCalculation(true);
  };

  // 按钮点击处理
  const handleButtonClick = (value) => {
    // 按键视觉反馈
    setActiveKey(value);
    setTimeout(() => setActiveKey(null), 150);

    // 清空
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
      setResult('');
      setIsNewCalculation(true);
      return;
    }

    // 退格
    if (value === '⌫') {
      if (expression.length > 0) {
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);

        // 更新显示（从最后一个运算符后面开始）
        const lastOperatorIndex = Math.max(
          newExpr.lastIndexOf('+'),
          newExpr.lastIndexOf('-'),
          newExpr.lastIndexOf('×'),
          newExpr.lastIndexOf('÷'),
          newExpr.lastIndexOf('%')
        );

        if (lastOperatorIndex === -1) {
          setDisplay(newExpr || '0');
        } else {
          const afterOperator = newExpr.slice(lastOperatorIndex + 1).trim();
          setDisplay(afterOperator || '0');
        }
      } else {
        setDisplay('0');
      }
      return;
    }

    // 等号计算
    if (value === '=') {
      if (!expression) return;

      const calculatedResult = calculateExpression(expression);

      if (calculatedResult.startsWith('Error')) {
        setResult(calculatedResult);
        showCopyToast('✗ ' + calculatedResult);
      } else {
        setResult(calculatedResult);
        setDisplay(calculatedResult);

        // 添加到历史记录
        addToHistory(expression, calculatedResult);

        // 设置为新计算，方便继续输入
        setExpression(calculatedResult);
        setIsNewCalculation(true);
      }
      return;
    }

    // 运算符
    if (['+', '-', '×', '÷', '%'].includes(value)) {
      if (expression) {
        // 如果最后一个字符是运算符，替换它
        const lastChar = expression.trim().slice(-1);
        if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
          const newExpr = expression.trim().slice(0, -1) + value + ' ';
          setExpression(newExpr);
        } else {
          setExpression(expression + ' ' + value + ' ');
        }
      } else if (display !== '0') {
        setExpression(display + ' ' + value + ' ');
      }
      setDisplay('0');
      setIsNewCalculation(true);
      return;
    }

    // 小数点
    if (value === '.') {
      if (!display.includes('.')) {
        if (isNewCalculation) {
          setDisplay('0.');
          // 如果 expression 以运算符结尾，追加 '0.'；否则替换为 '0.'
          const lastChar = expression.trim().slice(-1);
          if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
            setExpression(expression + '0.');
          } else {
            setExpression('0.');
          }
          setIsNewCalculation(false);
        } else {
          const newDisplay = display + '.';
          setDisplay(newDisplay);

          // 从表达式中找到当前数字的起始位置并更新
          let currentNumStart = expression.length;
          for (let i = expression.length - 1; i >= 0; i--) {
            if (['+', '-', '×', '÷', '%', ' '].includes(expression[i])) {
              currentNumStart = i + 1;
              break;
            }
            if (i === 0) {
              currentNumStart = 0;
            }
          }
          const beforeNum = expression.slice(0, currentNumStart);
          setExpression(beforeNum + newDisplay);
        }
      }
      return;
    }

    // 数字
    if (isNewCalculation) {
      setDisplay(value);
      // 如果 expression 以运算符结尾，追加数字；否则替换整个表达式
      const lastChar = expression.trim().slice(-1);
      if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
        setExpression(expression + value);
      } else {
        setExpression(value);
      }
      setIsNewCalculation(false);
    } else {
      const newDisplay = display === '0' ? value : display + value;
      setDisplay(newDisplay);

      // 更新表达式：找到当前数字并替换
      let currentNumStart = expression.length;
      for (let i = expression.length - 1; i >= 0; i--) {
        if (['+', '-', '×', '÷', '%', ' '].includes(expression[i])) {
          currentNumStart = i + 1;
          break;
        }
        if (i === 0) {
          currentNumStart = 0;
        }
      }
      const beforeNum = expression.slice(0, currentNumStart);
      setExpression(beforeNum + newDisplay);
    }
  };

  // 键盘事件监听
  useEffect(() => {
    const keyMap = {
      // 数字键
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',

      // 小键盘数字
      'Numpad0': '0', 'Numpad1': '1', 'Numpad2': '2',
      'Numpad3': '3', 'Numpad4': '4', 'Numpad5': '5',
      'Numpad6': '6', 'Numpad7': '7', 'Numpad8': '8',
      'Numpad9': '9',

      // 运算符
      '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%',
      'NumpadAdd': '+', 'NumpadSubtract': '-',
      'NumpadMultiply': '×', 'NumpadDivide': '÷',

      // 功能键
      'Enter': '=', 'NumpadEnter': '=',
      'Escape': 'C',
      'Backspace': '⌫',
      '.': '.', 'NumpadDecimal': '.',
    };

    const handleKeyPress = (event) => {
      // 阻止某些默认行为
      if (['Enter', 'Backspace', 'Escape'].includes(event.key)) {
        event.preventDefault();
      }

      const key = keyMap[event.key] || keyMap[event.code];

      if (key) {
        handleButtonClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [expression, display, result, history, isNewCalculation]);

  // 按钮配置
  const buttons = [
    // Row 1
    [
      { value: 'C', label: 'C', type: 'clear' },
      { value: '⌫', label: '⌫', type: 'backspace' },
      { value: '%', label: '%', type: 'operator' },
      { value: '÷', label: '÷', type: 'operator' },
    ],
    // Row 2
    [
      { value: '7', label: '7', type: 'number' },
      { value: '8', label: '8', type: 'number' },
      { value: '9', label: '9', type: 'number' },
      { value: '×', label: '×', type: 'operator' },
    ],
    // Row 3
    [
      { value: '4', label: '4', type: 'number' },
      { value: '5', label: '5', type: 'number' },
      { value: '6', label: '6', type: 'number' },
      { value: '-', label: '-', type: 'operator' },
    ],
    // Row 4
    [
      { value: '1', label: '1', type: 'number' },
      { value: '2', label: '2', type: 'number' },
      { value: '3', label: '3', type: 'number' },
      { value: '+', label: '+', type: 'operator' },
    ],
    // Row 5
    [
      { value: '0', label: '0', type: 'number', span: 2 },
      { value: '.', label: '.', type: 'number' },
      { value: '=', label: '=', type: 'equals' },
    ],
  ];

  // 按钮样式
  const getButtonStyle = (button) => {
    const baseStyle = {
      padding: '24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      gridColumn: button.span ? `span ${button.span}` : 'span 1',
    };

    const isActive = activeKey === button.value;

    if (button.type === 'clear') {
      return {
        ...baseStyle,
        background: isActive ? colors.error : colors.errorBg,
        color: colors.error,
        border: `1px solid ${colors.errorBorder}`,
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
      };
    }

    if (button.type === 'equals') {
      return {
        ...baseStyle,
        background: colors.gradientPrimary,
        color: '#fff',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        boxShadow: isActive ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
      };
    }

    if (button.type === 'operator' || button.type === 'backspace') {
      return {
        ...baseStyle,
        background: isActive ? colors.primary : colors.primaryBg,
        color: colors.primaryLight,
        border: `1px solid ${colors.primaryBorder}`,
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
      };
    }

    // number
    return {
      ...baseStyle,
      background: isActive ? colors.border : colors.cardBg,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      transform: isActive ? 'scale(0.95)' : 'scale(1)',
    };
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
          计算器
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          支持基本四则运算，自动保存历史记录，支持键盘输入
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px',
      }}>
        {/* 计算器主体 */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
        }}>
          {/* 显示屏 */}
          <div style={{
            background: colors.inputBg,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: `1px solid ${colors.border}`,
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            transition: 'all 0.3s ease',
          }}>
            {/* 表达式显示 */}
            <div style={{
              color: colors.textSecondary,
              fontSize: '0.9rem',
              fontFamily: "'Consolas', 'Monaco', monospace",
              marginBottom: '8px',
              minHeight: '20px',
              wordBreak: 'break-all',
            }}>
              {expression || '\u00A0'}
            </div>

            {/* 结果显示 */}
            <div style={{
              color: colors.textPrimary,
              fontSize: '2rem',
              fontWeight: '600',
              fontFamily: "'Consolas', 'Monaco', monospace",
              wordBreak: 'break-all',
            }}>
              {display}
            </div>
          </div>

          {/* 按钮网格 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}>
            {buttons.map((row, rowIndex) => (
              row.map((button, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleButtonClick(button.value)}
                  style={getButtonStyle(button)}
                  onMouseEnter={(e) => {
                    if (button.type === 'number') {
                      e.target.style.background = colors.inputBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (button.type === 'number' && activeKey !== button.value) {
                      e.target.style.background = colors.cardBg;
                    }
                  }}
                >
                  {button.label}
                </button>
              ))
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <h3 style={{
              color: colors.textPrimary,
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'color 0.3s ease',
            }}>
              历史记录
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderLight}`,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  background: 'transparent',
                  color: colors.textSecondary,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.errorBg;
                  e.target.style.color = colors.error;
                  e.target.style.borderColor = colors.errorBorder;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = colors.textSecondary;
                  e.target.style.borderColor = colors.borderLight;
                }}
              >
                清空历史
              </button>
            )}
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '500px',
          }}>
            {history.length === 0 ? (
              <div style={{
                color: colors.textTertiary,
                textAlign: 'center',
                padding: '40px 20px',
                fontSize: '0.9rem',
              }}>
                暂无计算历史
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  style={{
                    background: colors.inputBg,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colors.cardBgHover || colors.background;
                    e.target.style.borderColor = colors.primaryBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.inputBg;
                    e.target.style.borderColor = colors.border;
                  }}
                >
                  <div style={{
                    color: colors.textSecondary,
                    fontSize: '0.85rem',
                    fontFamily: "'Consolas', 'Monaco', monospace",
                    marginBottom: '4px',
                  }}>
                    {item.expression}
                  </div>
                  <div style={{
                    color: colors.primaryLight,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: "'Consolas', 'Monaco', monospace",
                  }}>
                    = {item.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div style={{
        background: colors.primaryBg,
        borderRadius: '12px',
        padding: '16px 20px',
        border: `1px solid ${colors.primaryBorder}`,
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          color: colors.textSecondary,
          fontSize: '0.9rem',
          lineHeight: '1.6',
        }}>
          💡 <strong style={{ color: colors.textPrimary }}>使用提示：</strong>
          支持键盘输入（主键盘和小键盘均可），
          Enter 键计算，Esc 键清空，Backspace 键退格。
          点击历史记录可快速恢复计算。
        </div>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toastMessage.startsWith('✓')
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
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
