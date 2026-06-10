import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const BASES = [
  { label: '二进制', short: 'BIN', base: 2, prefix: '0b' },
  { label: '八进制', short: 'OCT', base: 8, prefix: '0o' },
  { label: '十进制', short: 'DEC', base: 10, prefix: '' },
  { label: '十六进制', short: 'HEX', base: 16, prefix: '0x' },
];

const HEX_CHARS = '0123456789ABCDEF';

function toBase(decimalValue, base) {
  if (decimalValue === 0n) return '0';
  const isNeg = decimalValue < 0n;
  let n = isNeg ? -decimalValue : decimalValue;
  let result = '';
  while (n > 0n) {
    result = HEX_CHARS[Number(n % BigInt(base))] + result;
    n = n / BigInt(base);
  }
  return isNeg ? '-' + result : result;
}

function fromBase(str, base) {
  str = str.trim().replace(/^0[xXbBoO]/, '');
  if (!str) return null;
  const isNeg = str.startsWith('-');
  if (isNeg) str = str.slice(1);
  const upper = str.toUpperCase();
  const validChars = HEX_CHARS.slice(0, base);
  for (const ch of upper) {
    if (!validChars.includes(ch)) return null;
  }
  let result = 0n;
  for (const ch of upper) {
    result = result * BigInt(base) + BigInt(HEX_CHARS.indexOf(ch));
  }
  return isNeg ? -result : result;
}

export default function BaseConverter() {
  const { colors } = useTheme();
  const [values, setValues] = useState({ 2: '', 8: '', 10: '', 16: '' });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [customBase, setCustomBase] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleInput = (base, raw) => {
    const input = raw.trim();
    if (!input) {
      setValues({ 2: '', 8: '', 10: '', 16: '' });
      setError('');
      setCustomValue('');
      return;
    }
    const decimal = fromBase(input, base);
    if (decimal === null) {
      setError(`"${input}" 不是有效的 ${base} 进制数`);
      setValues(prev => ({ ...prev, [base]: input }));
      return;
    }
    setError('');
    const next = {};
    for (const b of [2, 8, 10, 16]) {
      next[b] = toBase(decimal, b);
    }
    next[base] = input.toUpperCase();
    setValues(next);

    // update custom base too
    const cb = parseInt(customBase, 10);
    if (cb >= 2 && cb <= 36) {
      setCustomValue(toBase(decimal, cb));
    }
  };

  const handleCustomBase = (raw) => {
    setCustomBase(raw);
    setCustomError('');
    const cb = parseInt(raw, 10);
    if (!raw) { setCustomValue(''); return; }
    if (isNaN(cb) || cb < 2 || cb > 36) {
      setCustomError('进制范围：2 ~ 36');
      setCustomValue('');
      return;
    }
    const decimal = fromBase(values[10] || '0', 10);
    if (decimal !== null) {
      setCustomValue(toBase(decimal, cb));
    }
  };

  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast('✓ 已复制'));
  };

  const clear = () => {
    setValues({ 2: '', 8: '', 10: '', 16: '' });
    setCustomValue('');
    setError('');
  };

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.3s ease',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    color: colors.textPrimary,
    fontSize: '1rem',
    fontFamily: "'Consolas', 'Monaco', monospace",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ color: colors.textPrimary, fontSize: '1.8rem', fontWeight: '600', margin: '0 0 8px 0' }}>
          进制转换
        </h2>
        <p style={{ color: colors.textTertiary, fontSize: '1rem', margin: 0 }}>
          支持二、八、十、十六进制及自定义进制实时互转，支持大整数
        </p>
      </header>

      {error && (
        <div style={{
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: '10px',
          padding: '12px 16px',
          color: colors.error,
          marginBottom: '20px',
          fontSize: '0.9rem',
        }}>
          ✗ {error}
        </div>
      )}

      {/* 主要进制卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {BASES.map(({ label, short, base, prefix }) => (
          <div key={base} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: colors.primaryBg,
                  color: colors.primaryLight,
                  border: `1px solid ${colors.primaryBorder}`,
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                }}>
                  {short}
                </span>
                <span style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{label} (base {base})</span>
              </div>
              <button
                onClick={() => copy(values[base])}
                disabled={!values[base]}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.borderLight}`,
                  background: 'transparent',
                  color: values[base] ? colors.textSecondary : colors.textDisabled,
                  fontSize: '0.8rem',
                  cursor: values[base] ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (values[base]) { e.target.style.background = colors.primaryBg; e.target.style.color = colors.primaryLight; }}}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = values[base] ? colors.textSecondary : colors.textDisabled; }}
              >
                复制
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              {prefix && (
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textTertiary,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  pointerEvents: 'none',
                }}>
                  {prefix}
                </span>
              )}
              <input
                type="text"
                value={values[base]}
                onChange={e => handleInput(base, e.target.value)}
                placeholder={`输入${label}...`}
                style={{ ...inputStyle, paddingLeft: prefix ? `${prefix.length * 10 + 16}px` : '16px' }}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.border}
                spellCheck={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 自定义进制 + 清空 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '8px' }}>自定义进制 (2~36)</div>
              <input
                type="number"
                value={customBase}
                onChange={e => handleCustomBase(e.target.value)}
                placeholder="进制"
                min={2}
                max={36}
                style={{ ...inputStyle, width: '100px', textAlign: 'center' }}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = customError ? colors.error : colors.border}
              />
              {customError && <div style={{ color: colors.error, fontSize: '0.78rem', marginTop: '4px' }}>{customError}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '8px' }}>转换结果</div>
              <div style={{
                ...inputStyle,
                background: colors.inputBg,
                color: customValue ? colors.primaryLight : colors.textDisabled,
                cursor: 'default',
                userSelect: 'all',
                letterSpacing: '0.05em',
              }}>
                {customValue || '—'}
              </div>
            </div>
            <button
              onClick={() => copy(customValue)}
              disabled={!customValue}
              style={{
                alignSelf: 'flex-end',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `1px solid ${colors.borderLight}`,
                background: 'transparent',
                color: customValue ? colors.textSecondary : colors.textDisabled,
                cursor: customValue ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                fontSize: '0.85rem',
              }}
              onMouseEnter={e => { if (customValue) { e.target.style.background = colors.primaryBg; e.target.style.color = colors.primaryLight; }}}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = customValue ? colors.textSecondary : colors.textDisabled; }}
            >
              复制
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={clear}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: `1px solid ${colors.errorBorder}`,
              background: colors.errorBg,
              color: colors.error,
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              height: '100%',
            }}
            onMouseEnter={e => { e.target.style.background = colors.error; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = colors.errorBg; e.target.style.color = colors.error; }}
          >
            清空
          </button>
        </div>
      </div>

      {/* 快捷参考表 */}
      <div style={cardStyle}>
        <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0' }}>
          常用数值参考
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'monospace' }}>
            <thead>
              <tr>
                {['十进制', '十六进制', '八进制', '二进制'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    fontWeight: '600',
                    fontFamily: 'system-ui',
                    fontSize: '0.8rem',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,255,256,1023,1024,65535,65536].map((n, i) => {
                const bn = BigInt(n);
                return (
                  <tr
                    key={n}
                    onClick={() => {
                      setValues({ 2: toBase(bn,2), 8: toBase(bn,8), 10: String(n), 16: toBase(bn,16) });
                      const cb = parseInt(customBase,10);
                      if (cb>=2&&cb<=36) setCustomValue(toBase(bn,cb));
                      setError('');
                    }}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = colors.primaryBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {[String(n), toBase(bn,16), toBase(bn,8), toBase(bn,2)].map((v, j) => (
                      <td key={j} style={{
                        padding: '8px 16px',
                        color: j === 0 ? colors.textPrimary : colors.primaryLight,
                        borderBottom: i < 21 ? `1px solid ${colors.border}` : 'none',
                      }}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
