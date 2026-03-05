/**
 * 复制文本到剪贴板的工具函数
 * 提供了多种降级方案以处理不同浏览器环境
 */

/**
 * 使用传统的 document.execCommand 方法复制文本
 * @param text 要复制的文本
 * @returns 是否成功
 */
function fallbackCopyTextToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // 避免滚动到底部
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback: 无法复制文本', err);
    document.body.removeChild(textArea);
    return false;
  }
}

/**
 * 复制文本到剪贴板
 * 优先使用现代 Clipboard API，失败时降级到传统方法
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API 失败，尝试降级方案', err);
      // 降级到传统方法
      return fallbackCopyTextToClipboard(text);
    }
  } else {
    // 浏览器不支持 Clipboard API，直接使用降级方案
    return fallbackCopyTextToClipboard(text);
  }
}
