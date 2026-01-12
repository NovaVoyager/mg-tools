import React from 'react';
import { menuItems } from './menuConfig';

export default function Sidebar({ activeMenu, setActiveMenu }) {
  return (
    <aside style={{
      width: '240px',
      background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 0',
      flexShrink: 0,
      position: 'relative',
    }}>
      <div style={{
        padding: '0 20px 30px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '20px',
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: '1.3rem',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
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
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))'
                : 'transparent',
              color: item.disabled
                ? 'rgba(255,255,255,0.3)'
                : activeMenu === item.id
                  ? '#a5b4fc'
                  : 'rgba(255,255,255,0.7)',
              borderLeft: activeMenu === item.id
                ? '3px solid #6366f1'
                : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.disabled && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.4)',
              }}>
                即将推出
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        width: '240px',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
            margin: 0,
            lineHeight: '1.5',
          }}>
            💡 所有操作均在本地完成，文件不会上传到服务器
          </p>
        </div>
      </div>
    </aside>
  );
}
