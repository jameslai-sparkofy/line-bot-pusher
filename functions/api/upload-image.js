// 圖片上傳到 R2 API
export async function onRequest(context) {
  const { request, env } = context;

  // 僅允許 POST 請求
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return jsonResponse({
        success: false,
        error: 'No image file provided'
      }, 400);
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      }, 400);
    }

    // 檢查檔案大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return jsonResponse({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      }, 400);
    }

    // 生成唯一檔案名稱
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.type.split('/')[1];
    const fileName = `flex-images/${timestamp}-${randomString}.${extension}`;

    // 上傳到 R2
    const arrayBuffer = await file.arrayBuffer();
    await env.R2_IMAGES.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 生成公開 URL (需要設定 custom domain 或使用 R2 public URL)
    const publicUrl = `https://line-bot-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/${fileName}`;
    
    // 記錄到資料庫
    try {
      await env.DB.prepare(`
        INSERT INTO r2_images (file_name, original_name, file_type, file_size, public_url, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        fileName,
        file.name,
        file.type,
        file.size,
        publicUrl
      ).run();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 繼續執行，不要因為 DB 錯誤而失敗
    }

    return jsonResponse({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        fileName: fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        publicUrl: publicUrl,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return jsonResponse({
      success: false,
      error: 'Upload failed: ' + error.message
    }, 500);
  }
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