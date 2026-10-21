import path from 'node:path';
export function denyPrivateRequest(rawPath) {
  let value;
  try { value = decodeURIComponent(rawPath.split('?')[0]); } catch { return true; }
  if (/[\x00-\x1f\x7f\\]/.test(value) || /%[0-9a-f]{2}/i.test(value)) return true;
  if (value.split('/').some(part => part === '..' || (part.startsWith('.') && part !== '.well-known'))) return true;
  value = path.posix.normalize('/' + value.replace(/^\/+/, ''));
  if (/\.(?:php\d*|phtml|phar)(?:[/.;]|$)/i.test(value)) return true;
  if (/^\/(?:play-app|analytics|node_modules|scripts|tools|reports|release-verification|blender)(?:\/|$)/i.test(value)) return true;
  if (/(?:^|\/)(?:server\.(?:js|mjs|cjs)|og-card\.js|wizard-page\.js|package(?:-lock)?\.json|(?:pnpm-lock|yarn)\.(?:yaml|lock)|AGENTS\.md|Dockerfile|railway\.json|request-guard\.cjs)$/i.test(value)) return true;
  if (/\.(?:sqlite(?:3)?(?:-wal|-shm)?|db|sql|bak|backup|env|log|pem|key)(?:$|\/)/i.test(value)) return true;
  return false;
}
