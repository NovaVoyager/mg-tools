import React, { useState, useEffect, useRef } from 'react';
import { createJSONEditor } from 'vanilla-jsoneditor';
import ReactJson from 'react-json-view';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { useTheme } from '../../theme/ThemeContext';

export default function JSONTools() {
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'viewer'
  const [jsonData, setJsonData] = useState({
    message: '欢迎使用 JSON 工具',
    features: {
      editor: ['代码编辑', '树形视图', '搜索替换', '格式化', '语法高亮'],
      viewer: ['可视化展示', '折叠展开', '编辑节点', '复制节点', '添加删除']
    },
    example: {
      name: 'mg-tools',
      version: '1.0.0',
      description: 'JSON 编辑器 + 查看器',
      numbers: [1, 2, 3, 4, 5],
      nested: {
        level1: {
          level2: '深度嵌套示例'
        }
      }
    }
  });
  const [inputText, setInputText] = useState('');
  const [isValidJSON, setIsValidJSON] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // 初始化 vanilla-jsoneditor
  useEffect(() => {
    if (viewMode === 'editor' && containerRef.current && !editorRef.current) {
      editorRef.current = createJSONEditor({
        target: containerRef.current,
        props: {
          mode: 'text',
          mainMenuBar: true,
          navigationBar: true,
          statusBar: true,
          readOnly: false,
          indentation: 2,
          onChange: (content, previousContent, { contentErrors }) => {
            if (contentErrors) {
              setIsValidJSON(false);
              setErrorMessage(contentErrors.validationErrors?.[0]?.message || 'JSON 格式错误');
            } else {
              setIsValidJSON(true);
              setErrorMessage('');
            }
          },
        },
      });

      // 设置初始内容
      editorRef.current.set({ json: jsonData });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // 当切换模式时，同步数据
  useEffect(() => {
    if (viewMode === 'editor' && editorRef.current) {
      editorRef.current.set({ json: jsonData });
    }
  }, [jsonData, viewMode]);

  const handleLoadJSON = () => {
    try {
      const parsed = JSON.parse(inputText);
      setJsonData(parsed);
      setIsValidJSON(true);
      setErrorMessage('');
      setInputText('');
    } catch (error) {
      setIsValidJSON(false);
      setErrorMessage('无效的 JSON 格式：' + error.message);
    }
  };

  const handleClear = () => {
    setJsonData({});
    setIsValidJSON(true);
    setErrorMessage('');

    if (viewMode === 'editor' && editorRef.current) {
      editorRef.current.set({ json: {} });
    }
  };

  const handleCopy = async () => {
    try {
      let jsonString;

      if (viewMode === 'editor' && editorRef.current) {
        const content = editorRef.current.get();
        if (content.json !== undefined) {
          jsonString = JSON.stringify(content.json, null, 2);
        } else if (content.text !== undefined) {
          jsonString = content.text;
        } else {
          throw new Error('无法获取内容');
        }
      } else {
        jsonString = JSON.stringify(jsonData, null, 2);
      }

      await navigator.clipboard.writeText(jsonString);
      alert('JSON 已复制到剪贴板');
    } catch (error) {
      alert('复制失败：' + error.message);
    }
  };

  const handleDownload = () => {
    try {
      let jsonString;

      if (viewMode === 'editor' && editorRef.current) {
        const content = editorRef.current.get();
        if (content.json !== undefined) {
          jsonString = JSON.stringify(content.json, null, 2);
        } else if (content.text !== undefined) {
          jsonString = content.text;
        } else {
          throw new Error('无法获取内容');
        }
      } else {
        jsonString = JSON.stringify(jsonData, null, 2);
      }

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mg-json-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('下载失败：' + error.message);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setJsonData(json);
        setIsValidJSON(true);
        setErrorMessage('');

        if (viewMode === 'editor' && editorRef.current) {
          editorRef.current.set({ json });
        }
      } catch (error) {
        setIsValidJSON(false);
        setErrorMessage('文件内容不是有效的 JSON');
        alert('文件内容不是有效的 JSON：' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // react-json-view 的回调
  const handleEdit = (edit) => {
    setJsonData(edit.updated_src);
  };

  const handleAdd = (add) => {
    setJsonData(add.updated_src);
  };

  const handleDelete = (del) => {
    setJsonData(del.updated_src);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          JSON 工具
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          JSON 格式化、校验、编辑、查看 - 支持专业编辑器和可视化查看器两种模式
        </p>
      </header>

      {/* 视图切换按钮 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '8px',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease',
      }}>
        <button
          onClick={() => setViewMode('editor')}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: viewMode === 'editor'
              ? colors.gradientPrimary
              : 'transparent',
            color: viewMode === 'editor' ? '#fff' : colors.textSecondary,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          📝 专业编辑器
        </button>
        <button
          onClick={() => setViewMode('viewer')}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: viewMode === 'viewer'
              ? colors.gradientPrimary
              : 'transparent',
            color: viewMode === 'viewer' ? '#fff' : colors.textSecondary,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          👁️ 可视化查看器
        </button>
      </div>

      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: `1px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: colors.cardBg,
            color: colors.textSecondary,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📋 复制
        </button>

        <button
          onClick={handleDownload}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: `1px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: colors.cardBg,
            color: colors.textSecondary,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ⬇️ 下载
        </button>

        <label style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: `1px solid ${colors.borderLight}`,
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          background: colors.cardBg,
          color: colors.textSecondary,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          📁 上传
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </label>

        <button
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: `1px solid ${colors.borderLight}`,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: colors.cardBg,
            color: colors.textSecondary,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🗑️ 清空
        </button>
      </div>

      {/* 编辑器/查看器容器 */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease',
      }}>
        {viewMode === 'editor' ? (
          <div
            ref={containerRef}
            style={{
              height: '600px',
              width: '100%',
            }}
          />
        ) : (
          <div>
            {/* 输入区域 */}
            <div style={{
              marginBottom: '20px',
            }}>
              <label style={{
                color: colors.textSecondary,
                display: 'block',
                marginBottom: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'color 0.3s ease',
              }}>
                输入或粘贴 JSON 文本
              </label>
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setIsValidJSON(true);
                  setErrorMessage('');
                }}
                placeholder='粘贴 JSON 文本到这里，例如：{"name": "example", "value": 123}'
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderLight}`,
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
              />
              {!isValidJSON && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  borderRadius: '8px',
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorBorder}`,
                  color: colors.error,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                }}>
                  ⚠️ {errorMessage}
                </div>
              )}
              <button
                onClick={handleLoadJSON}
                style={{
                  marginTop: '12px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  background: colors.gradientPrimary,
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✨ 加载 JSON
              </button>
            </div>

            {/* JSON 查看器 */}
            <div style={{
              background: colors.inputBg,
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '600px',
              overflowY: 'auto',
              transition: 'all 0.3s ease',
            }}>
              <ReactJson
              src={jsonData}
              theme={isDark ? "monokai" : "rjv-default"}
              iconStyle="triangle"
              displayDataTypes={true}
              displayObjectSize={true}
              enableClipboard={true}
              collapsed={2}
              name={false}
              onEdit={handleEdit}
              onAdd={handleAdd}
              onDelete={handleDelete}
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                background: 'transparent',
              }}
            />
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
          {viewMode === 'editor' ? '📝 专业编辑器功能' : '👁️ 可视化查看器功能'}
        </h3>
        {viewMode === 'editor' ? (
          <ul style={{
            color: colors.textSecondary,
            fontSize: '0.85rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
            transition: 'color 0.3s ease',
          }}>
            <li>支持树形视图和代码视图切换</li>
            <li>自动校验 JSON 格式</li>
            <li>支持搜索和替换功能</li>
            <li>可折叠/展开 JSON 节点</li>
            <li>支持上传 JSON 文件或下载编辑结果</li>
            <li>支持复制到剪贴板</li>
            <li>显示导航栏和状态栏</li>
          </ul>
        ) : (
          <ul style={{
            color: colors.textSecondary,
            fontSize: '0.85rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
            transition: 'color 0.3s ease',
          }}>
            <li>美观的树形结构展示 JSON 数据</li>
            <li>点击节点前的三角形图标可折叠/展开</li>
            <li>点击编辑图标（铅笔）可编辑值</li>
            <li>点击加号可添加新的键值对</li>
            <li>点击删除图标可删除节点</li>
            <li>点击复制图标可复制节点内容到剪贴板</li>
            <li>显示数据类型和对象大小信息</li>
          </ul>
        )}
      </div>
    </div>
  );
}
