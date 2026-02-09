// Encryption Utility using Web Crypto API

// 1. Derive AES-GCM Key from a Signature (or any high-entropy string)
export async function deriveKeyFromSignature(signature: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(signature),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("ENGRAM_SALT_V1"), // Fixed salt for deterministic derivation
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// 2. Encrypt Data (File/Blob)
export async function encryptFile(file: File, key: CryptoKey): Promise<{ encryptedBlob: Blob; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource, // Cast to satisfy TS
    },
    key,
    fileBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer], { type: 'application/octet-stream' }),
    iv: iv
  };
}

// 3. Decrypt Data
export async function decryptFile(encryptedBlob: Blob, key: CryptoKey, iv: Uint8Array, originalType: string): Promise<Blob> {
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource, // Cast to satisfy TS
    },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer], { type: originalType });
}

// Helper: Convert IV to Base64 for storage
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 to Uint8Array for IV usage
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
