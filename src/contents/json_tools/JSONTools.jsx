import React, { useState, useEffect, useRef } from 'react';
import { JSONEditor as VanillaJSONEditor } from 'vanilla-jsoneditor';
import ReactJson from 'react-json-view';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

export default function JSONTools() {
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
      editorRef.current = new VanillaJSONEditor({
        target: containerRef.current,
        props: {
          mode: 'tree',
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

      // 如果在编辑器模式，更新编辑器内容
      if (viewMode === 'editor' && editorRef.current) {
        editorRef.current.set({ json: parsed });
      }
    } catch (error) {
      setIsValidJSON(false);
      setErrorMessage('无效的 JSON 格式：' + error.message);
    }
  };

  const handleClear = () => {
    setJsonData({});
    setInputText('');
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
        setInputText('');

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

  const handleFormat = () => {
    if (viewMode === 'editor' && editorRef.current) {
      try {
        const content = editorRef.current.get();
        if (content.json) {
          editorRef.current.set({ json: content.json });
          setIsValidJSON(true);
          setErrorMessage('');
        }
      } catch (error) {
        setIsValidJSON(false);
        setErrorMessage(error.message);
      }
    } else if (inputText.trim()) {
      handleLoadJSON();
    }
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
          color: '#fff',
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
        }}>
          JSON 工具
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
          margin: 0,
        }}>
          JSON 格式化、校验、编辑、查看 - 支持专业编辑器和可视化查看器两种模式
        </p>
      </header>

      {/* 视图切换按钮 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '8px',
        border: '1px solid rgba(255,255,255,0.06)',
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
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'transparent',
            color: viewMode === 'editor' ? '#fff' : 'rgba(255,255,255,0.7)',
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
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'transparent',
            color: viewMode === 'viewer' ? '#fff' : 'rgba(255,255,255,0.7)',
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

      {/* 输入区域 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '20px',
      }}>
        <label style={{
          color: 'rgba(255,255,255,0.7)',
          display: 'block',
          marginBottom: '12px',
          fontSize: '0.9rem',
          fontWeight: '500',
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
            minHeight: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        {!isValidJSON && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.85rem',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}>
        <button
          onClick={handleLoadJSON}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ✨ 加载 JSON
        </button>

        {viewMode === 'editor' && (
          <button
            onClick={handleFormat}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            💎 格式化
          </button>
        )}

        <button
          onClick={handleCopy}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.7)',
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
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.7)',
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
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          background: 'rgba(255,255,255,0.03)',
          color: 'rgba(255,255,255,0.7)',
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
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.7)',
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
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
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
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '20px',
            maxHeight: '600px',
            overflowY: 'auto',
          }}>
            <ReactJson
              src={jsonData}
              theme="monokai"
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
        )}
      </div>

      {/* 功能说明 */}
      <div style={{
        marginTop: '30px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}>
        <h3 style={{
          color: '#a5b4fc',
          fontSize: '1rem',
          fontWeight: '600',
          margin: '0 0 12px 0',
        }}>
          {viewMode === 'editor' ? '📝 专业编辑器功能' : '👁️ 可视化查看器功能'}
        </h3>
        {viewMode === 'editor' ? (
          <ul style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
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
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
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
