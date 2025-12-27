import { renderToBuffer } from '@react-pdf/renderer';
import { IdCardPdfDocument } from '@/components/id-card-pdf';
import type { IdDesignConfig, DigitalIdWithRelations } from './pdf-types';
import { generateVerificationQrCode } from './qr-generator';
import https from 'https';
import http from 'http';
import React from 'react';

/**
 * Download image from URL and return as base64 data URI
 */
async function downloadImageAsDataUri(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = buffer.toString('base64');
        resolve(`data:${contentType};base64,${base64}`);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Convert buffer to base64 data URI
 */
function bufferToDataUri(buffer: Buffer, mimeType: string = 'image/png'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generate PDF for digital ID card using @react-pdf/renderer
 * Standard ID card size: 85.6mm x 53.98mm (credit card size)
 */
export async function generateIdCardPdf(
  digitalId: DigitalIdWithRelations,
  designConfig: IdDesignConfig,
  baseUrl?: string
): Promise<Buffer> {
  try {
    // Format dates
    const dateOfBirth = new Date(digitalId.citizen.dateOfBirth).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const issueDate = new Date(digitalId.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const expiryDate = digitalId.expiresAt
      ? new Date(digitalId.expiresAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

    // Prepare card data
    const fullName = `${digitalId.citizen.user.firstName || ''} ${digitalId.citizen.user.lastName || ''}`.trim();
    const phone = digitalId.citizen.phone || digitalId.citizen.user.phone || '';
    const nationality = designConfig.nationality || 'Ethiopian'; // Use config nationality or default

    // Download and convert images to data URIs
    let photoDataUri: string | undefined;
    if (digitalId.citizen.photoUrl) {
      try {
        photoDataUri = await downloadImageAsDataUri(digitalId.citizen.photoUrl);
      } catch (error) {
        console.warn('Failed to load citizen photo:', error);
      }
    }

    let logoDataUri: string | undefined;
    if (designConfig.logoUrl) {
      try {
        logoDataUri = await downloadImageAsDataUri(designConfig.logoUrl);
      } catch (error) {
        console.warn('Failed to load logo:', error);
      }
    }

    // Generate QR code as data URI
    let qrCodeDataUri: string | undefined;
    try {
      const qrBuffer = await generateVerificationQrCode(digitalId.id, baseUrl, {
        width: 200,
        margin: 1,
      });
      qrCodeDataUri = bufferToDataUri(qrBuffer, 'image/png');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }

    const cardData = {
      name: fullName,
      idNumber: digitalId.id,
      kabale: digitalId.application.kabale.name,
      issueDate,
      expiryDate,
      dateOfBirth,
      sex: digitalId.citizen.gender || undefined,
      phone: phone || undefined,
      nationality,
      address: digitalId.citizen.address || undefined,
      photoUrl: photoDataUri,
      logoUrl: logoDataUri,
      qrCodeDataUrl: qrCodeDataUri,
    };

    // Render PDF document
    const pdfDoc: React.ReactElement<any> = React.createElement(IdCardPdfDocument, {
      config: designConfig,
      data: cardData,
    });

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(pdfDoc);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

