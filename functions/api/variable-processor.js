// 變數處理引擎 API
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    const {
      template_content, // Flex JSON 內容
      project_id,       // 建案 ID
      variables = {}    // 自訂變數
    } = data;

    if (!template_content) {
      return jsonResponse({
        success: false,
        error: 'template_content is required'
      }, 400);
    }

    // 處理變數替換
    const processedContent = await processVariables(template_content, project_id, variables, env);

    return jsonResponse({
      success: true,
      original_content: template_content,
      processed_content: processedContent,
      variables_used: extractVariables(JSON.stringify(template_content))
    });

  } catch (error) {
    console.error('Variable processing error:', error);
    return jsonResponse({
      success: false,
      error: 'Variable processing failed: ' + error.message
    }, 500);
  }
}

// 處理變數替換
async function processVariables(content, projectId, customVariables, env) {
  let contentString = JSON.stringify(content);
  
  // 1. 處理基礎變數
  const baseVariables = {
    date: new Date().toLocaleDateString('zh-TW'),
    datetime: new Date().toLocaleString('zh-TW'),
    timestamp: Date.now().toString(),
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    day: new Date().getDate().toString()
  };

  // 2. 載入建案資料變數
  let projectVariables = {};
  if (projectId) {
    try {
      const project = await env.DB.prepare(`
        SELECT * FROM projects WHERE project_id = ?
      `).bind(projectId).first();

      if (project) {
        projectVariables = {
          project_name: project.project_name,
          project_location: project.location || '',
          project_description: project.description || '',
          project_total_units: project.total_units?.toString() || '0',
          project_contact_phone: project.contact_phone || '',
          project_contact_email: project.contact_email || ''
        };

        // 載入棟別資料
        const buildings = await env.DB.prepare(`
          SELECT * FROM project_buildings 
          WHERE project_id = ? 
          ORDER BY building_name
        `).bind(projectId).all();

        if (buildings.results?.length > 0) {
          projectVariables.building_count = buildings.results.length.toString();
          
          // 為每棟建築建立變數
          buildings.results.forEach((building, index) => {
            const buildingKey = building.building_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            projectVariables[`building_${buildingKey}_name`] = building.building_name;
            projectVariables[`building_${buildingKey}_sold_percentage`] = building.sold_percentage || '0%';
            projectVariables[`building_${buildingKey}_sold_units`] = building.sold_units?.toString() || '0';
            projectVariables[`building_${buildingKey}_total_units`] = building.total_units?.toString() || '0';
            projectVariables[`building_${buildingKey}_description`] = building.description || '';
            
            // 簡化的索引變數 (building_1, building_2...)
            projectVariables[`building_${index + 1}_name`] = building.building_name;
            projectVariables[`building_${index + 1}_sold`] = building.sold_percentage || '0%';
          });

          // 常用的 A棟、B棟變數
          const commonNames = ['a', 'b', 'c', 'd', 'e'];
          buildings.results.slice(0, 5).forEach((building, index) => {
            const letter = commonNames[index];
            projectVariables[`building_${letter}_name`] = building.building_name;
            projectVariables[`building_${letter}_sold`] = building.sold_percentage || '0%';
            projectVariables[`building_${letter}_units`] = building.total_units?.toString() || '0';
          });
        }
      }
    } catch (error) {
      console.error('載入建案資料失敗:', error);
    }
  }

  // 3. 合併所有變數 (優先順序: 自訂變數 > 建案變數 > 基礎變數)
  const allVariables = {
    ...baseVariables,
    ...projectVariables,
    ...customVariables
  };

  // 4. 執行變數替換
  Object.keys(allVariables).forEach(key => {
    const regex = new RegExp(`\\\\{\\\\{${escapeRegExp(key)}\\\\}\\\\}`, 'g');
    contentString = contentString.replace(regex, allVariables[key] || '');
  });

  // 5. 處理特殊語法
  contentString = processSpecialSyntax(contentString, allVariables);

  try {
    return JSON.parse(contentString);
  } catch (error) {
    console.error('JSON 解析失敗:', error);
    return content; // 返回原始內容
  }
}

// 處理特殊語法
function processSpecialSyntax(content, variables) {
  // 處理條件語法: {{#if variable}}content{{/if}}
  content = content.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, innerContent) => {
    return variables[variable] && variables[variable] !== '0' && variables[variable] !== 'false' 
      ? innerContent 
      : '';
  });

  // 處理否定條件: {{#unless variable}}content{{/unless}}
  content = content.replace(/{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g, (match, variable, innerContent) => {
    return !variables[variable] || variables[variable] === '0' || variables[variable] === 'false'
      ? innerContent 
      : '';
  });

  // 處理預設值: {{variable || default_value}}
  content = content.replace(/{{(\w+)\s*\|\|\s*([^}]+)}}/g, (match, variable, defaultValue) => {
    return variables[variable] || defaultValue.replace(/['"]/g, '');
  });

  return content;
}

// 提取變數列表
function extractVariables(content) {
  const regex = /\\{\\{([^}]+)\\}\\}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim();
    // 排除特殊語法
    if (!variable.startsWith('#') && !variable.startsWith('/') && !variable.includes('||')) {
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }
  }

  return variables;
}

// 正規表達式轉義
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}