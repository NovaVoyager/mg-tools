import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];

function formatSize(n) {
  // n is BigInt representing bytes (i.e., 2^exp)
  const exp = Number(n).toString(2).length - 1; // rough log2
  for (let i = SIZE_UNITS.length - 1; i >= 0; i--) {
    const threshold = BigInt(1) << BigInt(i * 10);
    if (n >= threshold) {
      const val = Number(n) / Number(threshold);
      return `${val % 1 === 0 ? val : val.toFixed(2)} ${SIZE_UNITS[i]}`;
    }
  }
  return `${n} B`;
}

function computePow(exp) {
  if (exp < 0) return null;
  return BigInt(1) << BigInt(exp);
}

function toHex(bn) {
  if (bn === 0n) return '0x0';
  return '0x' + bn.toString(16).toUpperCase();
}

export default function PowerOfTwo() {
  const { colors } = useTheme();
  const [exp, setExp] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast('✓ 已复制'));
  };

  const handleExpChange = (v) => {
    setExp(v);
    if (v === '') { setError(''); return; }
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 0 || n > 1023) {
      setError('请输入 0 ~ 1023 之间的整数');
    } else {
      setError('');
    }
  };

  const parsedExp = parseInt(exp, 10);
  const validExp = !isNaN(parsedExp) && parsedExp >= 0 && parsedExp <= 1023;
  const result = validExp ? computePow(parsedExp) : null;
  const resultStr = result !== null ? result.toString() : '';
  const resultHex = result !== null ? toHex(result) : '';
  const resultBin = result !== null ? '1' + '0'.repeat(parsedExp) : '';
  const resultSize = result !== null && parsedExp <= 60 ? formatSize(result) : null;

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.3s ease',
  };

  const resultRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: colors.inputBg,
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    marginBottom: '10px',
    gap: '12px',
  };

  // prebuilt table rows: 0..63
  const tableRows = Array.from({ length: 64 }, (_, i) => i);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ color: colors.textPrimary, fontSize: '1.8rem', fontWeight: '600', margin: '0 0 8px 0' }}>
          2 的次方
        </h2>
        <p style={{ color: colors.textTertiary, fontSize: '1rem', margin: 0 }}>
          计算 2ⁿ 的十进制、十六进制、二进制及存储单位表示
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 左侧计算 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={cardStyle}>
            <div style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '12px' }}>
              输入指数 n（0 ~ 1023）
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: colors.textSecondary, fontSize: '1.4rem', fontWeight: '300' }}>2</span>
              <input
                type="number"
                value={exp}
                onChange={e => handleExpChange(e.target.value)}
                placeholder="n"
                min={0}
                max={1023}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  background: colors.inputBg,
                  border: `1px solid ${error ? colors.error : colors.border}`,
                  borderRadius: '10px',
                  color: colors.textPrimary,
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  textAlign: 'center',
                }}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = error ? colors.error : colors.border}
              />
              <span style={{ color: colors.textTertiary, fontSize: '1rem' }}>= ?</span>
            </div>
            {error && (
              <div style={{ color: colors.error, fontSize: '0.82rem', marginTop: '8px' }}>✗ {error}</div>
            )}
          </div>

          {result !== null && (
            <div style={cardStyle}>
              <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0' }}>
                2<sup style={{ fontSize: '0.7em' }}>{parsedExp}</sup> 的各进制表示
              </h3>

              {/* 十进制 */}
              <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>十进制</div>
              <div style={{ ...resultRowStyle, marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  color: colors.primaryLight,
                  fontFamily: 'monospace',
                  fontSize: resultStr.length > 30 ? '0.78rem' : '0.95rem',
                  wordBreak: 'break-all',
                  flex: 1,
                }}>
                  {resultStr}
                </span>
                <button onClick={() => copy(resultStr)} style={copyBtnStyle(colors)}>复制</button>
              </div>

              {/* 十六进制 */}
              <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>十六进制</div>
              <div style={{ ...resultRowStyle, marginBottom: '14px' }}>
                <span style={{ color: colors.primaryLight, fontFamily: 'monospace', fontSize: '0.95rem' }}>{resultHex}</span>
                <button onClick={() => copy(resultHex)} style={copyBtnStyle(colors)}>复制</button>
              </div>

              {/* 二进制 */}
              <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>二进制</div>
              <div style={{ ...resultRowStyle, marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  color: colors.primaryLight,
                  fontFamily: 'monospace',
                  fontSize: resultBin.length > 32 ? '0.72rem' : '0.95rem',
                  wordBreak: 'break-all',
                  flex: 1,
                }}>
                  {resultBin.length > 128 ? resultBin.slice(0, 64) + `…（共 ${resultBin.length} 位）` : resultBin}
                </span>
                <button onClick={() => copy(resultBin)} style={copyBtnStyle(colors)}>复制</button>
              </div>

              {/* 存储单位 */}
              {resultSize && (
                <>
                  <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>存储单位（以字节计）</div>
                  <div style={resultRowStyle}>
                    <span style={{ color: colors.success, fontFamily: 'monospace', fontSize: '1rem', fontWeight: '600' }}>
                      {resultSize}
                    </span>
                    <button onClick={() => copy(resultSize)} style={copyBtnStyle(colors)}>复制</button>
                  </div>
                </>
              )}
            </div>
          )}

          {result === null && exp !== '' && (
            <div style={{
              ...cardStyle,
              textAlign: 'center',
              padding: '40px',
              color: colors.textTertiary,
            }}>
              请输入有效的指数
            </div>
          )}

          {exp === '' && (
            <div style={{
              ...cardStyle,
              background: colors.primaryBg,
              border: `1px solid ${colors.primaryBorder}`,
              color: colors.textSecondary,
              fontSize: '0.9rem',
              lineHeight: '1.7',
            }}>
              💡 <strong style={{ color: colors.textPrimary }}>提示：</strong>
              输入指数 n，立即得到 2ⁿ 的十进制、十六进制、二进制结果。
              指数 10 = 1 KiB，20 = 1 MiB，30 = 1 GiB，40 = 1 TiB。
              点击下方表格行可快速填入。
            </div>
          )}
        </div>

        {/* 右侧参考表 */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0' }}>
            2⁰ ~ 2⁶³ 快速参考
          </h3>
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <thead style={{ position: 'sticky', top: 0, background: colors.cardBg, zIndex: 1 }}>
                <tr>
                  {['n', '2ⁿ（十进制）', '十六进制', '存储'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      color: colors.textSecondary,
                      borderBottom: `1px solid ${colors.border}`,
                      fontFamily: 'system-ui',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(i => {
                  const val = BigInt(1) << BigInt(i);
                  const valStr = val.toString();
                  const hexStr = toHex(val);
                  const sizeStr = formatSize(val);
                  const isActive = parsedExp === i;
                  return (
                    <tr
                      key={i}
                      onClick={() => { setExp(String(i)); setError(''); }}
                      style={{
                        cursor: 'pointer',
                        background: isActive ? colors.primaryBg : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = colors.cardBgHover; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '6px 12px', color: colors.primaryLight, fontWeight: '700', borderBottom: `1px solid ${colors.border}` }}>{i}</td>
                      <td style={{ padding: '6px 12px', color: colors.textPrimary, borderBottom: `1px solid ${colors.border}`, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{valStr}</td>
                      <td style={{ padding: '6px 12px', color: colors.textSecondary, borderBottom: `1px solid ${colors.border}` }}>{hexStr}</td>
                      <td style={{ padding: '6px 12px', color: colors.success, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sizeStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showToast && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
          color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem',
          fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999,
          animation: 'slideIn 0.3s ease',
        }}>
          {toastMsg}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(-50%) translateY(-20px); }
          to { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function copyBtnStyle(colors) {
  return {
    flexShrink: 0,
    padding: '4px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.borderLight}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}
