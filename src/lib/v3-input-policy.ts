// Shared browser/server preflight only. No credentials, evidence or provider code.
export const V3_QUESTION_LIMIT=2000;
export function hasIdentifiedSensitiveInput(text:string){
 return /\b(?:account|acct)(?:\s*(?:number|no\.?|#))?\s*[:=]?\s*\d[\d -]{5,}\b|\b\d{3}-\d{2}-\d{4}\b|\bsk-[A-Za-z0-9_-]{12,}\b|\bclient\s+(?:name|identity)\s*[:=]\s*\S+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:api[_ -]?key|access[_ -]?token|client[_ -]?secret|password)\s*[:=]\s*\S+|\bBearer\s+[A-Za-z0-9._~+/-]{12,}/i.test(text);
}
export function v3InputIssue(question:string,history:readonly {text:string}[]=[]):'invalid_text'|'sensitive_input'|null {
 if(!question.trim()||question.length>V3_QUESTION_LIMIT)return 'invalid_text';
 return [question,...history.map(h=>h.text)].some(hasIdentifiedSensitiveInput)?'sensitive_input':null;
}
export const V3_SENSITIVE_INPUT_MESSAGE='Remove client identity, contact details, account identifiers or credentials before submitting a public-company question.';
