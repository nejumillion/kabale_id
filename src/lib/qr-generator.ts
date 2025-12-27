import QRCode from 'qrcode';

/**
 * Generate verification URL for a digital ID
 * @param digitalIdId - The ID of the digital ID
 * @param baseUrl - Optional base URL (defaults to current origin)
 * @returns Full verification URL
 */
export function getVerificationUrl(digitalIdId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/verify/${digitalIdId}`;
}

/**
 * Generate QR code as PNG buffer
 * @param data - Data to encode in QR code (usually a URL)
 * @param options - Optional QR code options
 * @returns Promise resolving to PNG buffer
 */
export async function generateQrCode(
  data: string,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<Buffer> {
  const qrOptions = {
    width: options?.width || 200,
    margin: options?.margin || 2,
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    type: 'png' as const,
  };

  try {
    const qrBuffer = await QRCode.toBuffer(data, qrOptions);
    return qrBuffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for digital ID verification
 * @param digitalIdId - The ID of the digital ID
 * @param baseUrl - Optional base URL
 * @param options - Optional QR code options
 * @returns Promise resolving to PNG buffer
 */
export async function generateVerificationQrCode(
  digitalIdId: string,
  baseUrl?: string,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<Buffer> {
  const verificationUrl = getVerificationUrl(digitalIdId, baseUrl);
  return generateQrCode(verificationUrl, options);
}

