// Chat message encryption — client-side AES-256-GCM.
//
// Every client (faculty web, admin web, mobile) shares ONE symmetric key and
// this exact wire format, so any of them can decrypt what another wrote and the
// database only ever stores ciphertext. The layout is byte-compatible with the
// server's Node `crypto` helper (bank.encryption.ts):
//
//   base64( iv[16] || authTag[16] || ciphertext )
//
// with AES-256-GCM and the key being a 64-char hex string decoded to 32 bytes.
//
// SECURITY NOTE: because the key ships inside the app bundle, this protects
// against a database leak (rows are unreadable without the key) but NOT against
// someone who extracts the key from the shipped app. That tradeoff was chosen
// deliberately for mobile interoperability without a key-exchange system.

// The key is a 64-character hex string (a 256-bit / 32-byte random key, e.g.
// from `openssl rand -hex 32`). We hex-decode it to the 32 raw bytes AES-256
// needs. Every client (faculty web, mobile) MUST hex-decode the SAME string.
const KEY_HEX = import.meta.env.VITE_CHAT_ENCRYPTION_KEY as string | undefined

if (!KEY_HEX || !/^[0-9a-fA-F]{64}$/.test(KEY_HEX)) {
    // Fail loud in dev; a wrong key silently corrupts every message.
    throw new Error(
        'VITE_CHAT_ENCRYPTION_KEY must be a 64-character hex string (256-bit AES key).',
    )
}

const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
}

const KEY_BYTES = hexToBytes(KEY_HEX)

const IV_BYTES = 16
const TAG_BYTES = 16 // 128-bit GCM auth tag
const enc = new TextEncoder()
const dec = new TextDecoder()

// Import the shared key once and reuse the CryptoKey for every call.
let keyPromise: Promise<CryptoKey> | null = null
const getKey = (): Promise<CryptoKey> => {
    if (!keyPromise) {
        keyPromise = crypto.subtle.importKey(
            'raw',
            KEY_BYTES as BufferSource,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt'],
        )
    }
    return keyPromise
}

const toBase64 = (bytes: Uint8Array): string => {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
    return btoa(binary)
}

const fromBase64 = (b64: string): Uint8Array => {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

// Encrypt UTF-8 text → base64(iv || authTag || ciphertext).
export const encryptMessage = async (plainText: string): Promise<string> => {
    const key = await getKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
    // Web Crypto returns ciphertext WITH the auth tag appended at the end.
    const sealed = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: TAG_BYTES * 8 }, key, enc.encode(plainText)),
    )
    const cipherText = sealed.subarray(0, sealed.length - TAG_BYTES)
    const authTag = sealed.subarray(sealed.length - TAG_BYTES)

    // Repack into the server's iv || tag || ciphertext layout.
    const packed = new Uint8Array(IV_BYTES + TAG_BYTES + cipherText.length)
    packed.set(iv, 0)
    packed.set(authTag, IV_BYTES)
    packed.set(cipherText, IV_BYTES + TAG_BYTES)
    return toBase64(packed)
}

// Decrypt base64(iv || authTag || ciphertext) → UTF-8 text.
export const decryptMessage = async (encryptedText: string): Promise<string> => {
    const key = await getKey()
    const buffer = fromBase64(encryptedText)
    const iv = buffer.subarray(0, IV_BYTES)
    const authTag = buffer.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
    const cipherText = buffer.subarray(IV_BYTES + TAG_BYTES)

    // Web Crypto wants ciphertext WITH the tag appended back on.
    const sealed = new Uint8Array(cipherText.length + TAG_BYTES)
    sealed.set(cipherText, 0)
    sealed.set(authTag, cipherText.length)

    const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource, tagLength: TAG_BYTES * 8 },
        key,
        sealed as BufferSource,
    )
    return dec.decode(plain)
}

// Best-effort decrypt for values that MIGHT be legacy plaintext (messages
// written before encryption shipped). If it doesn't parse/decrypt as
// ciphertext, we assume it was stored plaintext and return it unchanged, so old
// conversations keep rendering instead of throwing.
export const decryptMessageSafe = async (
    value: string | null,
): Promise<string | null> => {
    if (value == null || value === '') return value
    try {
        return await decryptMessage(value)
    } catch {
        return value
    }
}
