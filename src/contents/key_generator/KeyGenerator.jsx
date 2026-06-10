import { useState, useCallback } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const CHARSET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  hex: '0123456789ABCDEF',
  base62: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};

function randomBytes(n) {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

function toHexStr(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64Str(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function toBase64UrlStr(bytes) {
  return toBase64Str(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function uuidV4() {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = toHexStr(b);
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

function randomPassword(length, opts) {
  let pool = '';
  if (opts.upper) pool += CHARSET.upper;
  if (opts.lower) pool += CHARSET.lower;
  if (opts.digits) pool += CHARSET.digits;
  if (opts.symbols) pool += CHARSET.symbols;
  if (!pool) pool = CHARSET.lower + CHARSET.digits;

  // Use rejection sampling to avoid modulo bias
  const result = [];
  const max = Math.floor(256 / pool.length) * pool.length;
  const bytes = randomBytes(length * 4);
  let bi = 0;
  while (result.length < length) {
    if (bi >= bytes.length) {
      crypto.getRandomValues(bytes);
      bi = 0;
    }
    const byte = bytes[bi++];
    if (byte < max) result.push(pool[byte % pool.length]);
  }
  return result.join('');
}

function randomHex(bytes) {
  return toHexStr(randomBytes(bytes));
}

function randomBase64(bytes) {
  return toBase64Str(randomBytes(bytes));
}

function randomBase64Url(bytes) {
  return toBase64UrlStr(randomBytes(bytes));
}

function randomApiKey(prefix) {
  const token = toBase64UrlStr(randomBytes(32)).slice(0, 43);
  return prefix ? `${prefix}_${token}` : token;
}

const GENERATOR_TYPES = [
  { id: 'uuid', label: 'UUID v4', desc: '通用唯一标识符，格式 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' },
  { id: 'password', label: '随机密码', desc: '可配置字符集的强密码' },
  { id: 'hex', label: '随机 HEX', desc: '十六进制随机字节串，常用于密钥、Token' },
  { id: 'base64', label: 'Base64 密钥', desc: '标准 Base64 编码随机字节，适合 JWT Secret 等' },
  { id: 'base64url', label: 'Base64URL', desc: 'URL 安全 Base64（无 +/=），适合 OAuth Token、API 密钥' },
  { id: 'apikey', label: 'API Key', desc: '带可选前缀的 API 密钥，格式 prefix_<token>' },
];

export default function KeyGenerator() {
  const { colors } = useTheme();

  const [activeType, setActiveType] = useState('uuid');
  const [count, setCount] = useState(5);
  const [results, setResults] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // password opts
  const [pwLen, setPwLen] = useState(20);
  const [pwOpts, setPwOpts] = useState({ upper: true, lower: true, digits: true, symbols: false });

  // hex / base64 opts
  const [byteCount, setByteCount] = useState(32);

  // api key opts
  const [apiPrefix, setApiPrefix] = useState('sk');

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const generate = useCallback(() => {
    const n = Math.min(Math.max(1, count), 20);
    const list = [];
    for (let i = 0; i < n; i++) {
      switch (activeType) {
        case 'uuid': list.push(uuidV4()); break;
        case 'password': list.push(randomPassword(pwLen, pwOpts)); break;
        case 'hex': list.push(randomHex(byteCount)); break;
        case 'base64': list.push(randomBase64(byteCount)); break;
        case 'base64url': list.push(randomBase64Url(byteCount)); break;
        case 'apikey': list.push(randomApiKey(apiPrefix)); break;
        default: list.push(uuidV4());
      }
    }
    setResults(list);
  }, [activeType, count, pwLen, pwOpts, byteCount, apiPrefix]);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast('✓ 已复制'));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.join('\n')).then(() => toast('✓ 已复制全部'));
  };

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.3s ease',
  };

  const toggleStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: `1px solid ${active ? colors.primaryBorder : colors.border}`,
    background: active ? colors.primaryBg : 'transparent',
    color: active ? colors.primaryLight : colors.textSecondary,
    fontSize: '0.85rem',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ color: colors.textPrimary, fontSize: '1.8rem', fontWeight: '600', margin: '0 0 8px 0' }}>
          随机密钥生成器
        </h2>
        <p style={{ color: colors.textTertiary, fontSize: '1rem', margin: 0 }}>
          在浏览器本地生成，不上传任何数据。支持 UUID、密码、HEX、Base64、API Key 等多种格式
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* 左侧配置 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 类型选择 */}
          <div style={cardStyle}>
            <div style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>
              生成类型
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {GENERATOR_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveType(t.id); setResults([]); }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${activeType === t.id ? colors.primaryBorder : colors.border}`,
                    background: activeType === t.id ? colors.primaryBg : 'transparent',
                    color: activeType === t.id ? colors.primaryLight : colors.textSecondary,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { if (activeType !== t.id) e.currentTarget.style.background = colors.cardBgHover; }}
                  onMouseLeave={e => { if (activeType !== t.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontWeight: activeType === t.id ? '600' : '400', fontSize: '0.9rem' }}>{t.label}</div>
                  <div style={{ fontSize: '0.74rem', color: colors.textTertiary, marginTop: '2px', lineHeight: '1.4' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 参数配置 */}
          <div style={cardStyle}>
            <div style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>
              参数配置
            </div>

            {/* 密码选项 */}
            {activeType === 'password' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>
                    长度：{pwLen} 位
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={128}
                    value={pwLen}
                    onChange={e => setPwLen(Number(e.target.value))}
                    style={{ width: '100%', accentColor: colors.primary }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textTertiary, fontSize: '0.72rem' }}>
                    <span>8</span><span>128</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { key: 'upper', label: 'A-Z' },
                    { key: 'lower', label: 'a-z' },
                    { key: 'digits', label: '0-9' },
                    { key: 'symbols', label: '!@#…' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setPwOpts(prev => ({ ...prev, [key]: !prev[key] }))}
                      style={toggleStyle(pwOpts[key])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* HEX / Base64 选项 */}
            {['hex', 'base64', 'base64url'].includes(activeType) && (
              <div>
                <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>
                  字节数：{byteCount}
                  {activeType === 'hex' && ` → ${byteCount * 2} 字符`}
                  {activeType === 'base64' && ` → ${Math.ceil(byteCount * 4 / 3)} 字符`}
                  {activeType === 'base64url' && ` → ${Math.ceil(byteCount * 4 / 3)} 字符`}
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={byteCount}
                  onChange={e => setByteCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: colors.primary }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textTertiary, fontSize: '0.72rem' }}>
                  <span>8B</span><span>64B</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {[16, 24, 32, 48, 64].map(n => (
                    <button key={n} onClick={() => setByteCount(n)} style={toggleStyle(byteCount === n)}>
                      {n}B
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* API Key 选项 */}
            {activeType === 'apikey' && (
              <div>
                <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>前缀（可留空）</div>
                <input
                  type="text"
                  value={apiPrefix}
                  onChange={e => setApiPrefix(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12))}
                  placeholder="如 sk、pk、api"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.textPrimary,
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
                <div style={{ color: colors.textTertiary, fontSize: '0.74rem', marginTop: '6px' }}>
                  格式：{apiPrefix ? `${apiPrefix}_` : ''}&lt;43位Base64URL&gt;
                </div>
              </div>
            )}

            {/* UUID 无额外选项 */}
            {activeType === 'uuid' && (
              <div style={{ color: colors.textTertiary, fontSize: '0.85rem' }}>
                遵循 RFC 4122 v4 标准，使用 <code style={{ background: colors.inputBg, padding: '1px 4px', borderRadius: '4px' }}>crypto.getRandomValues</code> 生成。
              </div>
            )}

            {/* 生成数量 */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ color: colors.textTertiary, fontSize: '0.78rem', marginBottom: '6px' }}>生成数量（1~20）</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[1, 3, 5, 10, 20].map(n => (
                  <button key={n} onClick={() => setCount(n)} style={toggleStyle(count === n)}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={generate}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: colors.gradientPrimary,
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
            onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
          >
            🔑 生成
          </button>
        </div>

        {/* 右侧结果 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0 }}>
              生成结果
              {results.length > 0 && (
                <span style={{
                  marginLeft: '10px',
                  background: colors.primaryBg,
                  color: colors.primaryLight,
                  border: `1px solid ${colors.primaryBorder}`,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                }}>
                  {results.length} 条
                </span>
              )}
            </h3>
            {results.length > 1 && (
              <button
                onClick={copyAll}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderLight}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.target.style.background = colors.primaryBg; e.target.style.color = colors.primaryLight; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = colors.textSecondary; }}
              >
                复制全部
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              color: colors.textTertiary,
              gap: '12px',
            }}>
              <div style={{ fontSize: '3rem' }}>🔑</div>
              <div style={{ fontSize: '0.9rem' }}>点击「生成」按钮开始</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: colors.inputBg,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = colors.primaryBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
                >
                  <span style={{
                    color: colors.textQuaternary,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    minWidth: '20px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{
                    flex: 1,
                    color: colors.primaryLight,
                    fontFamily: "'Consolas', 'Monaco', monospace",
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                    letterSpacing: '0.03em',
                  }}>
                    {val}
                  </span>
                  <button
                    onClick={() => copy(val)}
                    style={{
                      flexShrink: 0,
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${colors.borderLight}`,
                      background: 'transparent',
                      color: colors.textSecondary,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.target.style.background = colors.primaryBg; e.target.style.color = colors.primaryLight; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = colors.textSecondary; }}
                  >
                    复制
                  </button>
                </div>
              ))}

              {/* 重新生成 */}
              <button
                onClick={generate}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.primaryBorder}`,
                  background: colors.primaryBg,
                  color: colors.primaryLight,
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.target.style.background = colors.primary; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = colors.primaryBg; e.target.style.color = colors.primaryLight; }}
              >
                🔄 重新生成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 安全说明 */}
      <div style={{
        marginTop: '24px',
        background: colors.successBg,
        borderRadius: '12px',
        padding: '14px 20px',
        border: `1px solid ${colors.successBorder}`,
        color: colors.textSecondary,
        fontSize: '0.875rem',
        lineHeight: '1.6',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
        <span>
          <strong style={{ color: colors.success }}>完全本地生成</strong>
          ，使用浏览器内置的 <code style={{ background: colors.inputBg, padding: '1px 4px', borderRadius: '4px', fontSize: '0.82rem' }}>crypto.getRandomValues()</code> 密码学安全随机数，不与任何服务器通信，安全可靠。
        </span>
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
