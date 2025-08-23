export async function onRequest(context) {
  const { request, env, params } = context;
  const templateId = params.id;
  
  if (request.method !== 'GET') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    // 取得模板資料
    const stmt = env.DB.prepare(`
      SELECT * FROM message_templates 
      WHERE template_id = ? AND is_active = 1
    `);
    
    const template = await stmt.bind(templateId).first();
    
    if (!template) {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

    // 解析變數
    const variables = JSON.parse(template.variables || '[]');
    
    // 生成 API 文件
    const documentation = generateDocumentation(template, variables);
    
    return jsonResponse({
      success: true,
      data: {
        template_id: templateId,
        template_name: template.template_name,
        documentation: documentation,
        markdown: documentation.markdown
      }
    });

  } catch (error) {
    console.error('Generate documentation error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to generate documentation',
      details: error.message
    }, 500);
  }
}

function generateDocumentation(template, variables) {
  const baseUrl = 'https://line-bot-pusher.pages.dev';
  
  // 生成變數說明表格
  const variableTable = variables.length > 0 ? variables.map(variable => 
    `| ${variable.name} | ${variable.type} | ${variable.required ? '✓' : '✗'} | ${variable.description} | \`${variable.example || ''}\` |`
  ).join('\n') : '| - | - | - | 此模板不需要變數 | - |';

  // 生成 cURL 範例
  const curlExample = generateCurlExample(template.template_id, variables);
  
  // 生成 JavaScript 範例
  const jsExample = generateJavaScriptExample(template.template_id, variables);
  
  // 生成 Python 範例
  const pythonExample = generatePythonExample(template.template_id, variables);

  const markdown = `# API 文件 - ${template.template_name}

## 模板資訊

**模板ID：** \`${template.template_id}\`  
**模板名稱：** ${template.template_name}  
**分類：** ${template.category || '未分類'}  
**描述：** ${template.description || '無描述'}  

## API 端點

### 發送訊息
\`\`\`
POST ${baseUrl}/api/send-message
\`\`\`

### 請求標頭
\`\`\`
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
\`\`\`

### 請求參數

| 參數名稱 | 類型 | 必填 | 說明 | 範例 |
|---------|------|------|------|------|
| template_id | string | ✓ | 模板ID | \`${template.template_id}\` |
| group_id | string | ✓ | 目標群組ID | \`GROUP_123456\` |
| variables | object | ${variables.some(v => v.required) ? '✓' : '✗'} | 模板變數 | 見下方變數說明 |

### 模板變數

| 變數名稱 | 類型 | 必填 | 說明 | 範例 |
|---------|------|------|------|------|
${variableTable}

## 請求範例

### cURL
\`\`\`bash
${curlExample}
\`\`\`

### JavaScript (fetch)
\`\`\`javascript
${jsExample}
\`\`\`

### Python (requests)
\`\`\`python
${pythonExample}
\`\`\`

## 回應格式

### 成功回應
\`\`\`json
{
  "success": true,
  "data": {
    "message_id": "msg_1234567890",
    "template_id": "${template.template_id}",
    "group_id": "GROUP_123456",
    "sent_at": "2024-01-01T12:00:00Z"
  }
}
\`\`\`

### 錯誤回應
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
\`\`\`

## 錯誤代碼

| 狀態碼 | 說明 |
|-------|------|
| 200 | 成功 |
| 400 | 請求參數錯誤 |
| 401 | API 金鑰無效 |
| 404 | 模板或群組不存在 |
| 429 | 請求頻率過高 |
| 500 | 伺服器錯誤 |

## 訊息預覽

\`\`\`
${template.message_template}
\`\`\`

---
*此文件由系統自動生成，最後更新時間：${new Date().toLocaleString('zh-TW')}*`;

  return {
    markdown,
    variables,
    examples: {
      curl: curlExample,
      javascript: jsExample,
      python: pythonExample
    }
  };
}

function generateCurlExample(templateId, variables) {
  const variablesObject = variables.reduce((obj, variable) => {
    obj[variable.name] = variable.example || getDefaultValue(variable.type);
    return obj;
  }, {});

  return `curl -X POST https://line-bot-pusher.pages.dev/api/send-message \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "template_id": "${templateId}",
    "group_id": "GROUP_123456",
    "variables": ${JSON.stringify(variablesObject, null, 6).replace(/^/gm, '    ')}
  }'`;
}

function generateJavaScriptExample(templateId, variables) {
  const variablesObject = variables.reduce((obj, variable) => {
    obj[variable.name] = variable.example || getDefaultValue(variable.type);
    return obj;
  }, {});

  return `const response = await fetch('https://line-bot-pusher.pages.dev/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    template_id: '${templateId}',
    group_id: 'GROUP_123456',
    variables: ${JSON.stringify(variablesObject, null, 4).replace(/^/gm, '    ')}
  })
});

const result = await response.json();
console.log(result);`;
}

function generatePythonExample(templateId, variables) {
  const variablesObject = variables.reduce((obj, variable) => {
    obj[variable.name] = variable.example || getDefaultValue(variable.type);
    return obj;
  }, {});

  return `import requests

url = "https://line-bot-pusher.pages.dev/api/send-message"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = {
    "template_id": "${templateId}",
    "group_id": "GROUP_123456",
    "variables": ${JSON.stringify(variablesObject, null, 4).replace(/^/gm, '    ')}
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)`;
}

function getDefaultValue(type) {
  switch (type) {
    case 'string':
      return 'example_string';
    case 'number':
      return 123;
    case 'date':
      return '2024-01-01';
    case 'boolean':
      return true;
    default:
      return 'example_value';
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}