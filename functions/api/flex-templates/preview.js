// Flex Message 預覽 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    const { flex_content, variables = {} } = data;

    if (!flex_content) {
      return jsonResponse({
        success: false,
        error: 'flex_content is required'
      }, 400);
    }

    // 驗證和處理 Flex Message JSON
    let flexMessage;
    try {
      flexMessage = typeof flex_content === 'string' 
        ? JSON.parse(flex_content) 
        : flex_content;
    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'Invalid JSON format: ' + error.message
      }, 400);
    }

    // 基本驗證
    const validation = validateFlexMessage(flexMessage);
    if (!validation.valid) {
      return jsonResponse({
        success: false,
        error: 'Validation failed: ' + validation.error
      }, 400);
    }

    // 變數替換
    const processedMessage = processVariables(flexMessage, variables);

    return jsonResponse({
      success: true,
      processed_message: processedMessage,
      validation: {
        valid: true,
        message: 'Flex message is valid'
      }
    });

  } catch (error) {
    console.error('Flex message preview error:', error);
    return jsonResponse({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
}

// 驗證 Flex Message 格式
function validateFlexMessage(flexMessage) {
  try {
    // 檢查必要屬性
    if (!flexMessage.type) {
      return { valid: false, error: 'Missing type property' };
    }

    // 檢查支援的類型
    const supportedTypes = ['bubble', 'carousel'];
    if (!supportedTypes.includes(flexMessage.type)) {
      return { valid: false, error: 'Unsupported type: ' + flexMessage.type };
    }

    // Bubble 驗證
    if (flexMessage.type === 'bubble') {
      return validateBubble(flexMessage);
    }

    // Carousel 驗證
    if (flexMessage.type === 'carousel') {
      return validateCarousel(flexMessage);
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// 驗證 Bubble
function validateBubble(bubble) {
  // 檢查至少有一個主要區域
  if (!bubble.body && !bubble.header && !bubble.hero && !bubble.footer) {
    return { valid: false, error: 'Bubble must have at least one main area (header, hero, body, or footer)' };
  }

  // 驗證各區域
  if (bubble.header && !validateBox(bubble.header)) {
    return { valid: false, error: 'Invalid header box' };
  }

  if (bubble.body && !validateBox(bubble.body)) {
    return { valid: false, error: 'Invalid body box' };
  }

  if (bubble.footer && !validateBox(bubble.footer)) {
    return { valid: false, error: 'Invalid footer box' };
  }

  if (bubble.hero && !validateComponent(bubble.hero)) {
    return { valid: false, error: 'Invalid hero component' };
  }

  return { valid: true };
}

// 驗證 Carousel
function validateCarousel(carousel) {
  if (!carousel.contents || !Array.isArray(carousel.contents)) {
    return { valid: false, error: 'Carousel must have contents array' };
  }

  if (carousel.contents.length === 0) {
    return { valid: false, error: 'Carousel contents cannot be empty' };
  }

  if (carousel.contents.length > 12) {
    return { valid: false, error: 'Carousel can have at most 12 bubbles' };
  }

  // 驗證每個 bubble
  for (let i = 0; i < carousel.contents.length; i++) {
    const bubbleValidation = validateBubble(carousel.contents[i]);
    if (!bubbleValidation.valid) {
      return { valid: false, error: 'Bubble ' + (i + 1) + ': ' + bubbleValidation.error };
    }
  }

  return { valid: true };
}

// 驗證 Box 元件
function validateBox(box) {
  if (!box.type || box.type !== 'box') {
    return false;
  }

  if (!box.layout) {
    return false;
  }

  const supportedLayouts = ['vertical', 'horizontal', 'baseline'];
  if (!supportedLayouts.includes(box.layout)) {
    return false;
  }

  if (!box.contents || !Array.isArray(box.contents)) {
    return false;
  }

  // 驗證內容元件
  return box.contents.every(content => validateComponent(content));
}

// 驗證元件
function validateComponent(component) {
  if (!component.type) {
    return false;
  }

  const supportedTypes = ['box', 'text', 'button', 'image', 'icon', 'separator', 'spacer'];
  if (!supportedTypes.includes(component.type)) {
    return false;
  }

  // 根據類型進行特定驗證
  switch (component.type) {
    case 'box':
      return validateBox(component);
    case 'text':
      return typeof component.text === 'string';
    case 'button':
      return component.action && component.action.type;
    case 'image':
      return typeof component.url === 'string';
    default:
      return true;
  }
}

// 變數替換
function processVariables(flexMessage, variables) {
  let messageString = JSON.stringify(flexMessage);
  
  // 替換變數
  Object.keys(variables).forEach(key => {
    const regex = new RegExp('\\\\{\\\\{' + key + '\\\\}\\\\}', 'g');
    messageString = messageString.replace(regex, variables[key] || '{{' + key + '}}');
  });

  // 處理特殊變數
  messageString = messageString.replace(/\\\\{\\\\{timestamp\\\\}\\\\}/g, new Date().toLocaleString('zh-TW'));
  messageString = messageString.replace(/\\\\{\\\\{date\\\\}\\\\}/g, new Date().toLocaleDateString('zh-TW'));
  messageString = messageString.replace(/\\\\{\\\\{time\\\\}\\\\}/g, new Date().toLocaleTimeString('zh-TW'));

  try {
    return JSON.parse(messageString);
  } catch (error) {
    // 如果解析失敗，回傳原始訊息
    return flexMessage;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}