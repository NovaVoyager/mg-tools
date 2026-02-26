import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Parser } from 'node-sql-parser';

export default function SQLConverter() {
  const { colors } = useTheme();
  const [inputSQL, setInputSQL] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [targetLang, setTargetLang] = useState('go');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 支持的语言
  const languages = [
    { value: 'go', label: 'Go (Struct)', icon: '🐹' },
    { value: 'typescript', label: 'TypeScript (Interface)', icon: '📘' },
    { value: 'java', label: 'Java (Class)', icon: '☕' },
    { value: 'python', label: 'Python (Dataclass)', icon: '🐍' },
  ];

  // SQL 类型映射到各语言类型
  const typeMapping = {
    go: {
      'INT': 'int',
      'BIGINT': 'int64',
      'TINYINT': 'int8',
      'SMALLINT': 'int16',
      'MEDIUMINT': 'int32',
      'VARCHAR': 'string',
      'CHAR': 'string',
      'TEXT': 'string',
      'LONGTEXT': 'string',
      'MEDIUMTEXT': 'string',
      'TINYTEXT': 'string',
      'DATETIME': 'time.Time',
      'TIMESTAMP': 'time.Time',
      'DATE': 'time.Time',
      'TIME': 'time.Time',
      'FLOAT': 'float32',
      'DOUBLE': 'float64',
      'DECIMAL': 'float64',
      'BOOLEAN': 'bool',
      'BOOL': 'bool',
      'JSON': 'string',
      'BLOB': '[]byte',
    },
    typescript: {
      'INT': 'number',
      'BIGINT': 'number',
      'TINYINT': 'number',
      'SMALLINT': 'number',
      'MEDIUMINT': 'number',
      'VARCHAR': 'string',
      'CHAR': 'string',
      'TEXT': 'string',
      'LONGTEXT': 'string',
      'MEDIUMTEXT': 'string',
      'TINYTEXT': 'string',
      'DATETIME': 'Date',
      'TIMESTAMP': 'Date',
      'DATE': 'Date',
      'TIME': 'string',
      'FLOAT': 'number',
      'DOUBLE': 'number',
      'DECIMAL': 'number',
      'BOOLEAN': 'boolean',
      'BOOL': 'boolean',
      'JSON': 'object',
      'BLOB': 'Uint8Array',
    },
    java: {
      'INT': 'Integer',
      'BIGINT': 'Long',
      'TINYINT': 'Byte',
      'SMALLINT': 'Short',
      'MEDIUMINT': 'Integer',
      'VARCHAR': 'String',
      'CHAR': 'String',
      'TEXT': 'String',
      'LONGTEXT': 'String',
      'MEDIUMTEXT': 'String',
      'TINYTEXT': 'String',
      'DATETIME': 'LocalDateTime',
      'TIMESTAMP': 'Timestamp',
      'DATE': 'LocalDate',
      'TIME': 'LocalTime',
      'FLOAT': 'Float',
      'DOUBLE': 'Double',
      'DECIMAL': 'BigDecimal',
      'BOOLEAN': 'Boolean',
      'BOOL': 'Boolean',
      'JSON': 'String',
      'BLOB': 'byte[]',
    },
    python: {
      'INT': 'int',
      'BIGINT': 'int',
      'TINYINT': 'int',
      'SMALLINT': 'int',
      'MEDIUMINT': 'int',
      'VARCHAR': 'str',
      'CHAR': 'str',
      'TEXT': 'str',
      'LONGTEXT': 'str',
      'MEDIUMTEXT': 'str',
      'TINYTEXT': 'str',
      'DATETIME': 'datetime',
      'TIMESTAMP': 'datetime',
      'DATE': 'date',
      'TIME': 'time',
      'FLOAT': 'float',
      'DOUBLE': 'float',
      'DECIMAL': 'Decimal',
      'BOOLEAN': 'bool',
      'BOOL': 'bool',
      'JSON': 'dict',
      'BLOB': 'bytes',
    },
  };

  // 转换下划线命名为驼峰命名
  const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  };

  // 转换下划线命名为帕斯卡命名
  const toPascalCase = (str) => {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  // 提取注释
  const extractComment = (col) => {
    if (col.comment && col.comment.value) {
      const commentValue = col.comment.value;
      // 处理字符串类型的注释
      if (typeof commentValue === 'string') {
        return commentValue.replace(/^['"]|['"]$/g, '');
      }
      // 处理对象类型的注释（某些解析器可能返回对象）
      if (typeof commentValue === 'object' && commentValue.value) {
        const val = String(commentValue.value);
        return val.replace(/^['"]|['"]$/g, '');
      }
      // 其他类型直接转换为字符串
      return String(commentValue).replace(/^['"]|['"]$/g, '');
    }
    return '';
  };

  // 解析 SQL 并生成代码
  const parseSQL = useCallback(() => {
    if (!inputSQL.trim()) {
      setError('');
      setOutputCode('');
      return;
    }

    try {
      setError('');
      const parser = new Parser();
      const ast = parser.astify(inputSQL, { database: 'MySQL' });

      if (!ast || (Array.isArray(ast) && ast.length === 0)) {
        throw new Error('无法解析 SQL 语句');
      }

      // 支持数组或单个对象
      const createStmt = Array.isArray(ast) ? ast[0] : ast;

      if (createStmt.type !== 'create' || createStmt.keyword !== 'table') {
        throw new Error('仅支持 CREATE TABLE 语句');
      }

      const tableName = createStmt.table[0].table;
      const columns = createStmt.create_definitions.filter(def => def.resource === 'column');

      if (columns.length === 0) {
        throw new Error('未找到表列定义');
      }

      // 提取表注释
      let tableComment = '';
      if (createStmt.table_options) {
        const commentOption = createStmt.table_options.find(opt => opt.keyword === 'COMMENT');
        if (commentOption && commentOption.value) {
          const commentValue = commentOption.value;
          if (typeof commentValue === 'string') {
            tableComment = commentValue.replace(/^['"]|['"]$/g, '');
          } else if (typeof commentValue === 'object' && commentValue.value) {
            tableComment = String(commentValue.value).replace(/^['"]|['"]$/g, '');
          } else {
            tableComment = String(commentValue).replace(/^['"]|['"]$/g, '');
          }
        }
      }

      let code = '';

      switch (targetLang) {
        case 'go':
          code = generateGoCode(tableName, columns, tableComment, createStmt);
          break;
        case 'typescript':
          code = generateTypeScriptCode(tableName, columns, tableComment);
          break;
        case 'java':
          code = generateJavaCode(tableName, columns, tableComment);
          break;
        case 'python':
          code = generatePythonCode(tableName, columns, tableComment);
          break;
        default:
          throw new Error('不支持的目标语言');
      }

      setOutputCode(code);
    } catch (err) {
      setError(`解析失败: ${err.message}`);
      setOutputCode('');
    }
  }, [inputSQL, targetLang]);

  // 自动转换 - 输入变化时自动触发
  useEffect(() => {
    const timer = setTimeout(() => {
      parseSQL();
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSQL, targetLang]);

  // 生成 Go 代码
  const generateGoCode = (tableName, columns, tableComment, createStmt) => {
    const structName = toPascalCase(tableName);
    let code = '';

    // 添加表注释
    if (tableComment) {
      code += `// ${tableComment}\n`;
    }
    code += `type ${structName} struct {\n`;

    // 提取主键信息
    const primaryKeys = new Set();
    if (createStmt && createStmt.create_definitions) {
      createStmt.create_definitions.forEach(def => {
        if (def.resource === 'constraint' && def.constraint_type === 'primary key') {
          def.definition.forEach(pk => {
            primaryKeys.add(pk.column);
          });
        }
      });
    }

    columns.forEach(col => {
      const fieldName = toPascalCase(col.column.column);
      const sqlType = col.definition.dataType.toUpperCase();

      // 处理 unsigned 类型
      let goType = typeMapping.go[sqlType] || 'interface{}';
      if (col.definition.suffix && col.definition.suffix.includes('UNSIGNED')) {
        if (sqlType === 'INT') goType = 'uint';
        else if (sqlType === 'BIGINT') goType = 'uint64';
        else if (sqlType === 'TINYINT') goType = 'uint8';
        else if (sqlType === 'SMALLINT') goType = 'uint16';
        else if (sqlType === 'MEDIUMINT') goType = 'uint32';
      }

      const columnName = col.column.column;
      const comment = extractComment(col);

      // 构建 GORM 标签
      const gormParts = [`column:${columnName}`];

      // 检查是否为主键
      if (primaryKeys.has(columnName)) {
        gormParts.push('primary_key');
      }

      // 检查 AUTO_INCREMENT
      if (col.auto_increment) {
        gormParts.push('AUTO_INCREMENT');
      }

      // 检查 NOT NULL
      if (col.nullable && col.nullable.type === 'not null') {
        gormParts.push('NOT NULL');
      }

      // 检查 DEFAULT 值
      if (col.default_val) {
        let defaultValue = '';
        if (col.default_val.value) {
          if (typeof col.default_val.value === 'object') {
            defaultValue = col.default_val.value.value || '';
          } else {
            defaultValue = col.default_val.value;
          }
          // 移除引号
          defaultValue = String(defaultValue).replace(/^['"]|['"]$/g, '');
          if (defaultValue && defaultValue !== 'CURRENT_TIMESTAMP') {
            gormParts.push(`default:${defaultValue}`);
          }
        }
      }

      const gormTag = gormParts.join(';');
      const jsonTag = columnName;
      const tags = `\`gorm:"${gormTag}" json:"${jsonTag}"\``;

      // 添加字段
      code += `    ${fieldName.padEnd(12)} ${goType.padEnd(8)} ${tags}`;

      // 添加字段注释
      if (comment) {
        code += ` // ${comment}`;
      }
      code += '\n';
    });

    code += `}\n\n`;
    code += `func (m *${structName}) TableName() string {\n`;
    code += `    return "${tableName}"\n`;
    code += `}`;

    return code;
  };

  // 生成 TypeScript 代码
  const generateTypeScriptCode = (tableName, columns, tableComment) => {
    const interfaceName = toPascalCase(tableName);
    let code = '';

    // 添加表注释
    if (tableComment) {
      code += `/**\n * ${tableComment}\n */\n`;
    }
    code += `interface ${interfaceName} {\n`;

    columns.forEach(col => {
      const fieldName = toCamelCase(col.column.column);
      const sqlType = col.definition.dataType.toUpperCase();
      const tsType = typeMapping.typescript[sqlType] || 'any';
      const nullable = col.nullable && col.nullable.type === 'null' ? '?' : '';
      const comment = extractComment(col);

      // 添加字段注释
      if (comment) {
        code += `  /** ${comment} */\n`;
      }
      code += `  ${fieldName}${nullable}: ${tsType};\n`;
    });

    code += `}`;

    return code;
  };

  // 生成 Java 代码
  const generateJavaCode = (tableName, columns, tableComment) => {
    const className = toPascalCase(tableName);
    let code = '';

    // 添加表注释
    if (tableComment) {
      code += `/**\n * ${tableComment}\n */\n`;
    }
    code += `public class ${className} {\n\n`;

    columns.forEach(col => {
      const fieldName = toCamelCase(col.column.column);
      const sqlType = col.definition.dataType.toUpperCase();
      const javaType = typeMapping.java[sqlType] || 'Object';
      const comment = extractComment(col);

      // 添加字段注释
      if (comment) {
        code += `    /** ${comment} */\n`;
      }
      code += `    private ${javaType} ${fieldName};\n`;
    });

    code += `\n`;

    // 生成 getter 和 setter
    columns.forEach(col => {
      const fieldName = toCamelCase(col.column.column);
      const methodName = toPascalCase(col.column.column);
      const sqlType = col.definition.dataType.toUpperCase();
      const javaType = typeMapping.java[sqlType] || 'Object';

      code += `    public ${javaType} get${methodName}() {\n`;
      code += `        return ${fieldName};\n`;
      code += `    }\n\n`;

      code += `    public void set${methodName}(${javaType} ${fieldName}) {\n`;
      code += `        this.${fieldName} = ${fieldName};\n`;
      code += `    }\n\n`;
    });

    code += `}`;

    return code;
  };

  // 生成 Python 代码
  const generatePythonCode = (tableName, columns, tableComment) => {
    const className = toPascalCase(tableName);
    let code = `from dataclasses import dataclass\n`;
    code += `from typing import Optional\n`;
    code += `from datetime import datetime, date, time\n`;
    code += `from decimal import Decimal\n\n`;
    code += `@dataclass\n`;
    code += `class ${className}:\n`;

    // 添加表注释
    if (tableComment) {
      code += `    """${tableComment}"""\n`;
    }

    columns.forEach(col => {
      const fieldName = col.column.column.toLowerCase();
      const sqlType = col.definition.dataType.toUpperCase();
      const pyType = typeMapping.python[sqlType] || 'Any';
      const nullable = col.nullable && col.nullable.type === 'null' ? 'Optional[' + pyType + ']' : pyType;
      const comment = extractComment(col);

      // 添加字段注释
      if (comment) {
        code += `    ${fieldName}: ${nullable}  # ${comment}\n`;
      } else {
        code += `    ${fieldName}: ${nullable}\n`;
      }
    });

    return code;
  };

  // 显示 toast 提示
  const showCopyToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!outputCode) return;
    try {
      await navigator.clipboard.writeText(outputCode);
      showCopyToast('✓ 已复制到剪贴板');
    } catch {
      showCopyToast('✗ 复制失败');
    }
  };

  // 清空
  const handleClear = () => {
    setInputSQL('');
    setOutputCode('');
    setError('');
  };

  // 示例 SQL
  const loadExample = () => {
    const exampleSQL = `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  is_active BOOLEAN DEFAULT true COMMENT '是否激活'
) COMMENT='用户表';`;
    setInputSQL(exampleSQL);
    setError('');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 8px 0',
          transition: 'color 0.3s ease',
        }}>
          SQL 转换器
        </h2>
        <p style={{
          color: colors.textTertiary,
          fontSize: '1rem',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          将 MySQL CREATE TABLE 语句转换为各种编程语言的结构体定义（支持表注释和字段注释）
        </p>
      </header>

      {/* 语言选择 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{
          color: colors.textSecondary,
          fontSize: '0.95rem',
          fontWeight: '500',
        }}>
          目标语言:
        </span>
        {languages.map(lang => (
          <button
            key={lang.value}
            onClick={() => {
              setTargetLang(lang.value);
              setOutputCode('');
              setError('');
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: targetLang === lang.value ? `2px solid ${colors.primary}` : `2px solid ${colors.borderLight}`,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              background: targetLang === lang.value ? colors.primaryBg : colors.cardBg,
              color: targetLang === lang.value ? colors.primaryLight : colors.textSecondary,
              transition: 'all 0.2s ease',
            }}
          >
            {lang.icon} {lang.label}
          </button>
        ))}
      </div>

      {/* 输入输出区域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {/* SQL 输入区域 */}
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
            marginBottom: '12px',
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
              SQL 输入
            </h3>
            <button
              onClick={loadExample}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.borderLight}`,
                cursor: 'pointer',
                fontSize: '0.85rem',
                background: 'transparent',
                color: colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              📝 加载示例
            </button>
          </div>
          <textarea
            value={inputSQL}
            onChange={(e) => {
              setInputSQL(e.target.value);
              setError('');
            }}
            placeholder="请输入 CREATE TABLE 语句...&#10;&#10;例如:&#10;CREATE TABLE users (&#10;  id INT PRIMARY KEY,&#10;  name VARCHAR(50)&#10;);"
            style={{
              width: '100%',
              minHeight: '400px',
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              color: colors.textPrimary,
              fontSize: '0.9rem',
              fontFamily: "'Consolas', 'Monaco', monospace",
              resize: 'vertical',
              lineHeight: '1.6',
              transition: 'all 0.3s ease',
            }}
          />
        </div>

        {/* 代码输出区域 */}
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
            marginBottom: '12px',
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
                background: outputCode ? colors.success : colors.textDisabled,
                borderRadius: '50%',
              }}></span>
              代码输出
            </h3>
            {outputCode && (
              <span style={{
                color: colors.success,
                fontSize: '0.85rem',
                fontWeight: '500',
              }}>
                {outputCode.split('\n').length} 行
              </span>
            )}
          </div>
          <div style={{
            width: '100%',
            minHeight: '400px',
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
            color: outputCode ? colors.textPrimary : colors.textDisabled,
            fontSize: '0.9rem',
            fontFamily: "'Consolas', 'Monaco', monospace",
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
          }}>
            {outputCode || '转换后的代码将显示在这里...'}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: colors.errorText,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{
          color: colors.textTertiary,
          fontSize: '0.85rem',
          fontStyle: 'italic',
        }}>
          💡 输入 SQL 后自动转换
        </span>

        {outputCode && (
          <button
            onClick={handleCopy}
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
            }}
          >
            📋 复制代码
          </button>
        )}

        <button
          onClick={handleClear}
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
          清空
        </button>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease',
        }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
