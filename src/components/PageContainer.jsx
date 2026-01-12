import React from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function PageContainer({ children }) {
  const { colors } = useTheme();

  // 注入主题颜色到子组件
  return (
    <div data-theme-colors={JSON.stringify(colors)}>
      {children}
    </div>
  );
}

// 导出一个 hook 用于组件内部获取颜色
export function usePageTheme() {
  const { colors } = useTheme();
  return { colors };
}
