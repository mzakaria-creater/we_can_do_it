/**
 * 📋 Clipboard Utility with Fallback
 * 
 * Provides a robust clipboard copy function that works in all browsers
 * and contexts, including when Clipboard API is blocked by permissions policy.
 * 
 * Features:
 * - Primary: Modern Clipboard API
 * - Fallback: execCommand('copy')
 * - Works in HTTP/HTTPS contexts
 * - Works when Clipboard API is blocked
 */

/**
 * Copy text to clipboard with fallback support
 * @param text - Text to copy
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silent fail, continue to fallback
    }
  }

  // Method 2: Fallback using execCommand (works in more contexts)
  return fallbackCopyToClipboard(text);
}

/**
 * Fallback method using execCommand
 * Works when Clipboard API is blocked or unavailable
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    
    // Style it to be invisible and off-screen
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.setAttribute('readonly', '');
    
    // Add to DOM
    document.body.appendChild(textarea);
    
    // Select text
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Copy using execCommand
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

/**
 * Copy text to clipboard with toast notification
 * @param text - Text to copy
 * @param successMessage - Success message for toast
 * @param errorMessage - Error message for toast
 * @param toast - Toast function from sonner
 */
export async function copyWithToast(
  text: string,
  successMessage: string,
  errorMessage: string,
  toast: any
): Promise<void> {
  const success = await copyToClipboard(text);
  
  if (success) {
    toast.success(successMessage);
  } else {
    toast.error(errorMessage);
  }
}