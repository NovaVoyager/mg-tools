import React, { useState, useRef, useCallback } from 'react';

const menuItems = [
  { id: 'image-format', icon: '🖼️', label: '图片格式转换', active: true },
  // { id: 'image-compress', icon: '📦', label: '图片压缩', disabled: true },
  // { id: 'image-resize', icon: '📐', label: '图片裁剪', disabled: true },
  // { id: 'image-watermark', icon: '💧', label: '图片水印', disabled: true },
  // { id: 'pdf-convert', icon: '📄', label: 'PDF转换', disabled: true },
  // { id: 'video-convert', icon: '🎬', label: '视频转换', disabled: true },
];

export default function ImageConverter() {
  const [activeMenu, setActiveMenu] = useState('image-format');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outputFormat, setOutputFormat] = useState('image/png');
  const [quality, setQuality] = useState(0.9);
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [convertedPreview, setConvertedPreview] = useState(null);
  const [originalInfo, setOriginalInfo] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const formats = [
    { value: 'image/png', label: 'PNG', ext: 'png', desc: '无损压缩，支持透明' },
    { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', desc: '有损压缩，体积小' },
    { value: 'image/webp', label: 'WebP', ext: 'webp', desc: '新一代格式，兼顾质量和体积' },
  ];

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('请选择有效的图片文件');
      return;
    }

    setOriginalInfo({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type,
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setPreview(e.target.result);
      setConvertedBlob(null);
      setConvertedPreview(null);
      setConvertedSize(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const convertImage = useCallback(() => {
    if (!image) return;
    setIsConverting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      // 使用 base64 Data URL 而非 blob URL，避免 CSP 限制
      const dataUrl = canvas.toDataURL(outputFormat, quality);
      setConvertedPreview(dataUrl);
      
      // 计算大小：base64 字符串转换为实际字节数
      const base64Length = dataUrl.split(',')[1].length;
      const sizeInBytes = Math.round((base64Length * 3) / 4);
      setConvertedSize(formatBytes(sizeInBytes));
      
      // 存储 dataUrl 用于下载
      setConvertedBlob(dataUrl);
      setIsConverting(false);
    };
    img.src = image;
  }, [image, outputFormat, quality]);

  const downloadImage = useCallback(() => {
    if (!convertedBlob) return;

    const format = formats.find((f) => f.value === outputFormat);
    const timestamp = Date.now();
    const filename = `mg-${timestamp}.${format.ext}`;
    
    // convertedBlob 现在是 data URL
    const link = document.createElement('a');
    link.href = convertedBlob;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [convertedBlob, outputFormat, formats]);

  const reset = useCallback(() => {
    setImage(null);
    setPreview(null);
    setConvertedBlob(null);
    setConvertedPreview(null);
    setOriginalInfo(null);
    setConvertedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f0f14',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* 左侧菜单 */}
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
              💡 所有转换均在本地完成，文件不会上传到服务器
            </p>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        padding: '40px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#fff',
              fontSize: '1.8rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
            }}>
              图片格式转换
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '1rem',
              margin: 0,
            }}>
              支持 PNG、JPEG、WebP 格式互转，可调节压缩质量
            </p>
          </header>

          {/* 上传区域 */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '16px',
              padding: '50px 30px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging 
                ? 'rgba(99, 102, 241, 0.08)' 
                : 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s ease',
              marginBottom: '30px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
            }}>
              📁
            </div>
            <p style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 8px 0' }}>
              拖放图片到这里，或点击选择文件
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
              支持 PNG, JPEG, WebP, GIF, BMP, AVIF 等格式
            </p>
          </div>

          {/* 转换设置和预览 */}
          {preview && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '30px',
            }}>
              {/* 原图 */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ 
                    color: '#fff', 
                    margin: 0, 
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#f59e0b',
                      borderRadius: '50%',
                    }}></span>
                    原始图片
                  </h3>
                  {originalInfo && (
                    <span style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.85rem',
                    }}>
                      {originalInfo.size}
                    </span>
                  )}
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={preview}
                    alt="Original"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                {originalInfo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                  }}>
                    <p style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.8rem',
                      margin: 0,
                      wordBreak: 'break-all',
                    }}>
                      {originalInfo.name} • {originalInfo.type}
                    </p>
                  </div>
                )}
              </div>

              {/* 转换后 */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ 
                    color: '#fff', 
                    margin: 0, 
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: convertedPreview ? '#10b981' : 'rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                    }}></span>
                    转换结果
                  </h3>
                  {convertedSize && (
                    <span style={{
                      color: '#10b981',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                    }}>
                      {convertedSize}
                    </span>
                  )}
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {convertedPreview ? (
                    <img
                      src={convertedPreview}
                      alt="Converted"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        选择格式后点击转换
                      </p>
                    </div>
                  )}
                </div>
                {convertedPreview && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}>
                    <p style={{
                      color: '#10b981',
                      fontSize: '0.8rem',
                      margin: 0,
                    }}>
                      ✓ 转换完成 • {formats.find(f => f.value === outputFormat)?.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 转换选项 */}
          {image && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h3 style={{ 
                color: '#fff', 
                margin: '0 0 20px 0', 
                fontSize: '1rem',
                fontWeight: '600',
              }}>
                转换设置
              </h3>
              
              {/* 格式选择 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  display: 'block', 
                  marginBottom: '12px',
                  fontSize: '0.9rem',
                }}>
                  输出格式
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {formats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        setOutputFormat(format.value);
                        setConvertedBlob(null);
                        setConvertedPreview(null);
                        setConvertedSize(null);
                      }}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: outputFormat === format.value 
                          ? '2px solid #6366f1'
                          : '2px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        background: outputFormat === format.value 
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(255,255,255,0.03)',
                        color: outputFormat === format.value ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        minWidth: '140px',
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{format.label}</div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'rgba(255,255,255,0.4)',
                        fontWeight: '400',
                      }}>
                        {format.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 质量调节 */}
              {outputFormat !== 'image/png' && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}>
                    <label style={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                    }}>
                      压缩质量
                    </label>
                    <span style={{
                      color: '#6366f1',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                    }}>
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setConvertedBlob(null);
                      setConvertedPreview(null);
                      setConvertedSize(null);
                    }}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      appearance: 'none',
                      background: `linear-gradient(to right, #6366f1 ${quality * 100}%, rgba(255,255,255,0.1) ${quality * 100}%)`,
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    <span>体积更小</span>
                    <span>质量更高</span>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap',
                paddingTop: '8px',
              }}>
                <button
                  onClick={convertImage}
                  disabled={isConverting}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: isConverting ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    transition: 'all 0.2s ease',
                    opacity: isConverting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isConverting ? (
                    <>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}></span>
                      转换中...
                    </>
                  ) : (
                    <>🔄 开始转换</>
                  )}
                </button>

                {convertedBlob && (
                  <button
                    onClick={downloadImage}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    ⬇️ 下载图片
                  </button>
                )}

                <button
                  onClick={reset}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.7)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  重置
                </button>
              </div>
            </div>
          )}

          {/* 隐藏的 Canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
