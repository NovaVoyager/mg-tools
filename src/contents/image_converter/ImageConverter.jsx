import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const formats = [
  { value: 'image/png', label: 'PNG', ext: 'png', desc: '无损压缩，支持透明' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', desc: '有损压缩，体积小' },
  { value: 'image/webp', label: 'WebP', ext: 'webp', desc: '新一代格式，兼顾质量和体积' },
];

export default function ImageConverter() {
  const { colors } = useTheme();
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
  }, [convertedBlob, outputFormat]);

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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          图片格式转换
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          支持 PNG, JPEG, WebP, GIF, BMP, AVIF 格式转换，可调节压缩质量
        </p>
      </header>

      {/* 上传区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? colors.primary : colors.borderLight}`,
          borderRadius: '16px',
          padding: '50px 30px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? colors.primaryBg : colors.cardBg,
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
          background: colors.primaryBg,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          transition: 'background 0.3s ease',
        }}>
          📁
        </div>
        <p style={{
          color: colors.textPrimary,
          fontSize: '1.1rem',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          拖放图片到这里，或点击选择文件
        </p>
        <p style={{
          color: colors.textQuaternary,
          fontSize: '0.9rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
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
            background: colors.cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h3 style={{
                color: colors.textPrimary,
                margin: 0,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.3s ease',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: colors.warning,
                  borderRadius: '50%',
                }}></span>
                原始图片
              </h3>
              {originalInfo && (
                <span style={{
                  color: colors.textTertiary,
                  fontSize: '0.85rem',
                  transition: 'color 0.3s ease',
                }}>
                  {originalInfo.size}
                </span>
              )}
            </div>
            <div style={{
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
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
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: '0.8rem',
                  margin: 0,
                  wordBreak: 'break-all',
                  transition: 'color 0.3s ease',
                }}>
                  {originalInfo.name} • {originalInfo.type}
                </p>
              </div>
            )}
          </div>

          {/* 转换后 */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h3 style={{
                color: colors.textPrimary,
                margin: 0,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.3s ease',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: convertedPreview ? colors.success : colors.textDisabled,
                  borderRadius: '50%',
                }}></span>
                转换结果
              </h3>
              {convertedSize && (
                <span style={{
                  color: colors.success,
                  fontSize: '0.85rem',
                  fontWeight: '500',
                }}>
                  {convertedSize}
                </span>
              )}
            </div>
            <div style={{
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
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
                  color: colors.textDisabled,
                  transition: 'color 0.3s ease',
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
                background: colors.successBg,
                borderRadius: '8px',
                border: `1px solid ${colors.successBorder}`,
                transition: 'all 0.3s ease',
              }}>
                <p style={{
                  color: colors.success,
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
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
        }}>
          <h3 style={{
            color: colors.textPrimary,
            margin: '0 0 20px 0',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'color 0.3s ease',
          }}>
            转换设置
          </h3>

          {/* 格式选择 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '12px',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease',
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
                      ? `2px solid ${colors.primary}`
                      : `2px solid ${colors.borderLight}`,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    background: outputFormat === format.value
                      ? colors.primaryBg
                      : colors.cardBg,
                    color: outputFormat === format.value ? colors.primaryLight : colors.textSecondary,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    minWidth: '140px',
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{format.label}</div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.textQuaternary,
                    fontWeight: '400',
                    transition: 'color 0.3s ease',
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
                  color: colors.textSecondary,
                  fontSize: '0.9rem',
                  transition: 'color 0.3s ease',
                }}>
                  压缩质量
                </label>
                <span style={{
                  color: colors.primary,
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
                  background: `linear-gradient(to right, ${colors.primary} ${quality * 100}%, ${colors.borderLight} ${quality * 100}%)`,
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '0.75rem',
                color: colors.textQuaternary,
                transition: 'color 0.3s ease',
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
                background: colors.gradientPrimary,
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
                  background: colors.gradientSuccess,
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
                border: `1px solid ${colors.borderLight}`,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                background: 'transparent',
                color: colors.textSecondary,
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
