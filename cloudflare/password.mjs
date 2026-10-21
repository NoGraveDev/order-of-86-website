import {pbkdf2Async} from '@noble/hashes/pbkdf2.js';
import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex,utf8ToBytes} from '@noble/hashes/utils.js';
// Existing accounts use 600,000 PBKDF2-HMAC-SHA256 iterations. Workers' native
// API caps this at 100,000. Preserve the algorithm and existing hashes exactly.
export async function hashPassword(password,salt){
 return bytesToHex(await pbkdf2Async(sha256,utf8ToBytes(password),utf8ToBytes(salt),{c:600000,dkLen:32,asyncTick:10}));
}
