import React from 'react';
import { menuItems } from './menuConfig';
import { useTheme } from '../theme/ThemeContext';

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const { colors, toggleTheme, isDark } = useTheme();

  return (
    <aside style={{
      width: '240px',
      background: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      padding: '20px 0',
      flexShrink: 0,
      position: 'relative',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{
        padding: '0 20px 30px',
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '20px',
      }}>
        {/* 标题和主题切换按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <h1 style={{
            color: colors.textPrimary,
            fontSize: '1.3rem',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'color 0.3s ease',
          }}>
            <span style={{
              background: colors.gradientPrimary,
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}>⚡</span>
            工具箱
          </h1>

          {/* 主题切换按钮 */}
          <button
            onClick={toggleTheme}
            title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `1px solid ${colors.borderLight}`,
              background: colors.cardBg,
              color: colors.textSecondary,
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.cardBgHover;
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.cardBg;
              e.currentTarget.style.borderColor = colors.borderLight;
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <div style={{
          background: colors.primaryBg,
          borderRadius: '8px',
          padding: '10px 12px',
          border: `1px solid ${colors.primaryBorder}`,
          transition: 'all 0.3s ease',
        }}>
          <p style={{
            color: colors.textSecondary,
            fontSize: '0.75rem',
            margin: 0,
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.3s ease',
          }}>
            <span>💡</span>
            <span>所有操作均在本地完成，文件不会上传到服务器</span>
          </p>
        </div>
      </div>

      <nav style={{ padding: '0 12px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setActiveMenu(item.id)}
            disabled={item.disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginBottom: '4px',
              border: 'none',
              borderRadius: '10px',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              background: activeMenu === item.id
                ? colors.gradientPrimaryBg
                : 'transparent',
              color: item.disabled
                ? colors.textDisabled
                : activeMenu === item.id
                  ? colors.primaryLight
                  : colors.textSecondary,
              borderLeft: activeMenu === item.id
                ? `3px solid ${colors.primary}`
                : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.disabled && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                background: colors.primaryBg,
                padding: '2px 6px',
                borderRadius: '4px',
                color: colors.textQuaternary,
                transition: 'all 0.3s ease',
              }}>
                即将推出
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
