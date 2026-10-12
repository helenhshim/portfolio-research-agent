// Configuration checks only. No requests occur in this script.
export function validateSecUserAgent(value) {
  if (!value || !value.trim()) throw new Error('SEC_USER_AGENT is required before SEC retrieval.');
  if (!/^[\x20-\x7E]+$/.test(value)) throw new Error('SEC_USER_AGENT must be a single printable ASCII header.');
  if (!/\S+@\S+\.\S+/.test(value)) throw new Error('SEC_USER_AGENT must identify the app and an operator contact email.');
  if (value.trim().split(/\s+/).length < 2) throw new Error('SEC_USER_AGENT must include an app identifier as well as contact.');
  return value.trim();
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  try {
    validateSecUserAgent(process.env.SEC_USER_AGENT);
    console.log('SEC header configuration passed. Header value omitted. No network test performed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
