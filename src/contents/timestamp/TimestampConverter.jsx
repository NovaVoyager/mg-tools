import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTheme } from '../../theme/ThemeContext';

dayjs.extend(utc);
dayjs.extend(timezone);

const timeFormats = [
  { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss', example: '2024-01-12 14:30:45' },
  { value: 'YYYY-MM-DD HH:mm:ss.SSS', label: 'YYYY-MM-DD HH:mm:ss.SSS (含毫秒)', example: '2024-01-12 14:30:45.123' },
  { value: 'YYYY/MM/DD HH:mm:ss', label: 'YYYY/MM/DD HH:mm:ss', example: '2024/01/12 14:30:45' },
  { value: 'DD/MM/YYYY HH:mm:ss', label: 'DD/MM/YYYY HH:mm:ss', example: '12/01/2024 14:30:45' },
  { value: 'MM-DD-YYYY HH:mm:ss', label: 'MM-DD-YYYY HH:mm:ss', example: '01-12-2024 14:30:45' },
  { value: 'YYYY年MM月DD日 HH:mm:ss', label: 'YYYY年MM月DD日 HH:mm:ss', example: '2024年01月12日 14:30:45' },
  { value: 'MMMM DD, YYYY HH:mm:ss', label: 'MMMM DD, YYYY HH:mm:ss (英文)', example: 'January 12, 2024 14:30:45' },
  { value: 'dddd, MMMM DD, YYYY HH:mm:ss', label: '完整日期时间 (英文)', example: 'Friday, January 12, 2024 14:30:45' },
];

export default function TimestampConverter() {
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [timestampInput, setTimestampInput] = useState('');
  const [timestampType, setTimestampType] = useState('auto'); // 'auto', 'seconds', 'milliseconds'
  const [convertedTime, setConvertedTime] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const [dateTimeInput, setDateTimeInput] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState({ seconds: '', milliseconds: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 显示 toast 提示
  const showCopyToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // 自动判断时间戳类型
  const detectTimestampType = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) return 'invalid';

    // 秒级时间戳通常是10位数字
    // 毫秒级时间戳通常是13位数字
    if (value.length === 10) {
      return 'seconds';
    } else if (value.length === 13) {
      return 'milliseconds';
    } else if (value.length < 10) {
      return 'seconds';
    } else {
      return 'milliseconds';
    }
  };

  // 时间戳转时间
  const handleTimestampToTime = () => {
    if (!timestampInput.trim()) {
      alert('请输入时间戳');
      return;
    }

    const num = parseInt(timestampInput);
    if (isNaN(num)) {
      setConvertedTime('无效的时间戳');
      return;
    }

    let type = timestampType;
    if (type === 'auto') {
      type = detectTimestampType(timestampInput);
      if (type === 'invalid') {
        setConvertedTime('无效的时间戳');
        return;
      }
    }

    const timestamp = type === 'seconds' ? num * 1000 : num;
    const date = dayjs(timestamp);

    if (!date.isValid()) {
      setConvertedTime('无效的时间戳');
      return;
    }

    setConvertedTime(date.format(selectedFormat));
  };

  // 时间转时间戳
  const handleTimeToTimestamp = () => {
    if (!dateTimeInput.trim()) {
      alert('请输入日期时间');
      return;
    }

    // 尝试解析多种日期格式
    let date = dayjs(dateTimeInput);

    // 如果第一次解析失败，尝试其他格式
    if (!date.isValid()) {
      for (const format of timeFormats) {
        date = dayjs(dateTimeInput, format.value);
        if (date.isValid()) break;
      }
    }

    if (!date.isValid()) {
      setConvertedTimestamp({ seconds: '无效的日期时间', milliseconds: '无效的日期时间' });
      return;
    }

    const ms = date.valueOf();
    const sec = Math.floor(ms / 1000);

    setConvertedTimestamp({
      seconds: sec.toString(),
      milliseconds: ms.toString(),
    });
  };

  const handleCopyTimestamp = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      showCopyToast('✓ 已复制到剪贴板');
    } catch {
      showCopyToast('✗ 复制失败');
    }
  };

  const handleCopyTime = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      showCopyToast('✓ 已复制到剪贴板');
    } catch {
      showCopyToast('✗ 复制失败');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          时间戳转换工具
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          时间戳与日期时间相互转换，支持秒级和毫秒级时间戳
        </p>
      </header>

      {/* 当前时间 */}
      <div style={{
        background: colors.gradientPrimaryBg,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${colors.primaryBorder}`,
        marginBottom: '30px',
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          color: colors.primaryLight,
          fontSize: '1rem',
          fontWeight: '600',
          margin: '0 0 16px 0',
          transition: 'color 0.3s ease',
        }}>
          ⏰ 当前时间
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          <div style={{
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              color: colors.textSecondary,
              fontSize: '0.8rem',
              marginBottom: '6px',
              transition: 'color 0.3s ease',
            }}>
              日期时间
            </div>
            <div style={{
              color: colors.textPrimary,
              fontSize: '1.1rem',
              fontWeight: '600',
              fontFamily: 'monospace',
              transition: 'color 0.3s ease',
            }}>
              {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
          <div style={{
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              color: colors.textSecondary,
              fontSize: '0.8rem',
              marginBottom: '6px',
              transition: 'color 0.3s ease',
            }}>
              时间戳（秒）
            </div>
            <div style={{
              color: colors.success,
              fontSize: '1.1rem',
              fontWeight: '600',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
            onClick={() => handleCopyTimestamp(Math.floor(currentTime.valueOf() / 1000).toString())}
            title="点击复制"
            >
              {Math.floor(currentTime.valueOf() / 1000)}
            </div>
          </div>
          <div style={{
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              color: colors.textSecondary,
              fontSize: '0.8rem',
              marginBottom: '6px',
              transition: 'color 0.3s ease',
            }}>
              时间戳（毫秒）
            </div>
            <div style={{
              color: colors.success,
              fontSize: '1.1rem',
              fontWeight: '600',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
            onClick={() => handleCopyTimestamp(currentTime.valueOf().toString())}
            title="点击复制"
            >
              {currentTime.valueOf()}
            </div>
          </div>
        </div>
      </div>

      {/* 时间戳转时间 */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${colors.border}`,
        marginBottom: '30px',
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          color: colors.textPrimary,
          fontSize: '1rem',
          fontWeight: '600',
          margin: '0 0 16px 0',
          transition: 'color 0.3s ease',
        }}>
          ⏩ 时间戳转时间
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
          }}>
            时间戳类型
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { value: 'auto', label: '自动识别' },
              { value: 'seconds', label: '秒（10位）' },
              { value: 'milliseconds', label: '毫秒（13位）' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setTimestampType(type.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: timestampType === type.value
                    ? `2px solid ${colors.primary}`
                    : `1px solid ${colors.borderLight}`,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  background: timestampType === type.value
                    ? colors.primaryBg
                    : colors.cardBg,
                  color: timestampType === type.value ? colors.primaryLight : colors.textSecondary,
                  transition: 'all 0.2s ease',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
          }}>
            输入时间戳
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="例如：1705046445 或 1705046445123"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderLight}`,
                background: colors.inputBg,
                color: colors.textPrimary,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                transition: 'all 0.3s ease',
              }}
            />
            <button
              onClick={handleTimestampToTime}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: colors.gradientPrimary,
                color: '#fff',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              转换
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
          }}>
            时间格式
          </label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${colors.borderLight}`,
              background: colors.inputBg,
              color: colors.textPrimary,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {timeFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label} - {format.example}
              </option>
            ))}
          </select>
        </div>

        {convertedTime && (
          <div style={{
            background: colors.successBg,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${colors.successBorder}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              color: colors.textSecondary,
              fontSize: '0.8rem',
              marginBottom: '6px',
              transition: 'color 0.3s ease',
            }}>
              转换结果
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{
                color: colors.success,
                fontSize: '1.1rem',
                fontWeight: '600',
                fontFamily: 'monospace',
              }}>
                {convertedTime}
              </div>
              <button
                onClick={() => handleCopyTime(convertedTime)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.successBorder}`,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  background: colors.successBg,
                  color: colors.success,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                📋 复制
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 时间转时间戳 */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          color: colors.textPrimary,
          fontSize: '1rem',
          fontWeight: '600',
          margin: '0 0 16px 0',
          transition: 'color 0.3s ease',
        }}>
          ⏪ 时间转时间戳
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
          }}>
            输入日期时间
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              placeholder="例如：2024-01-12 14:30:45"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderLight}`,
                background: colors.inputBg,
                color: colors.textPrimary,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                transition: 'all 0.3s ease',
              }}
            />
            <button
              onClick={handleTimeToTimestamp}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: colors.gradientPrimary,
                color: '#fff',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              转换
            </button>
          </div>
          <div style={{
            color: colors.textQuaternary,
            fontSize: '0.75rem',
            marginTop: '6px',
            transition: 'color 0.3s ease',
          }}>
            支持多种格式输入，如：2024-01-12 14:30:45、2024/01/12 14:30:45 等
          </div>
        </div>

        {convertedTimestamp.seconds && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div style={{
              background: colors.successBg,
              borderRadius: '12px',
              padding: '16px',
              border: `1px solid ${colors.successBorder}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                color: colors.textSecondary,
                fontSize: '0.8rem',
                marginBottom: '6px',
                transition: 'color 0.3s ease',
              }}>
                时间戳（秒）
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{
                  color: colors.success,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}>
                  {convertedTimestamp.seconds}
                </div>
                <button
                  onClick={() => handleCopyTimestamp(convertedTimestamp.seconds)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.successBorder}`,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: colors.successBg,
                    color: colors.success,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📋 复制
                </button>
              </div>
            </div>
            <div style={{
              background: colors.successBg,
              borderRadius: '12px',
              padding: '16px',
              border: `1px solid ${colors.successBorder}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                color: colors.textSecondary,
                fontSize: '0.8rem',
                marginBottom: '6px',
                transition: 'color 0.3s ease',
              }}>
                时间戳（毫秒）
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{
                  color: colors.success,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}>
                  {convertedTimestamp.milliseconds}
                </div>
                <button
                  onClick={() => handleCopyTimestamp(convertedTimestamp.milliseconds)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.successBorder}`,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: colors.successBg,
                    color: colors.success,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📋 复制
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 功能说明 */}
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
          <li>当前时间：实时显示当前日期时间和时间戳，点击时间戳可直接复制</li>
          <li>时间戳转时间：支持秒级（10位）和毫秒级（13位）时间戳输入，自动识别或手动选择</li>
          <li>时间转时间戳：支持多种日期时间格式输入，自动解析并转换为秒和毫秒时间戳</li>
          <li>格式选择：提供8种常用时间格式，包含中文、英文等多种样式</li>
          <li>快速复制：点击复制按钮或直接点击时间戳数值即可复制到剪贴板</li>
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
