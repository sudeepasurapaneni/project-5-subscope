export const MAX_INPUT_BYTES = 2 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 1_000_000;

export type Finding = {
  hostname: string;
  dnsStatus: 'Not checked';
  source: 'User-provided CT data';
};

export function validateDomain(input: string): string {
  const domain = input.trim().toLowerCase().replace(/\.+$/, '');
  if (!domain) throw new Error('Enter a target domain to continue.');
  if (domain.length > 253 || /[/:?#@\s]/.test(domain)) {
    throw new Error('Enter a hostname domain only, without a URL, path, or port.');
  }
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain) || domain.includes(':')) {
    throw new Error('IP addresses are not accepted. Enter a hostname domain.');
  }
  const labels = domain.split('.');
  const validLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (labels.length < 2 || labels.some((label) => !validLabel.test(label)) || /^\d+$/.test(labels.at(-1) ?? '')) {
    throw new Error('Enter a valid domain such as example.org.');
  }
  return domain;
}

function collectJsonNames(value: unknown): string[] {
  const records = Array.isArray(value) ? value : [value];
  const names: string[] = [];
  let recognized = false;
  for (const record of records) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
    const item = record as Record<string, unknown>;
    for (const field of ['name_value', 'dns_names', 'common_name']) {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        recognized = true;
        names.push(...fieldValue.split(/[\r\n]+/));
      } else if (field === 'dns_names' && Array.isArray(fieldValue)) {
        recognized = true;
        for (const entry of fieldValue) {
          if (typeof entry === 'string') names.push(...entry.split(/[\r\n]+/));
        }
      }
    }
  }
  if (!recognized || names.length === 0) {
    throw new Error('JSON must contain name_value, dns_names, or common_name fields.');
  }
  return names;
}

export function parseImport(text: string, maxCharacters = MAX_INPUT_BYTES): string[] {
  if (new TextEncoder().encode(text).byteLength > MAX_INPUT_BYTES) {
    throw new Error('Input is too large. Keep files under 2 MB.');
  }
  if (text.length > maxCharacters) {
    throw new Error('Pasted text is over the 1 MB limit. Remove some records.');
  }
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Add CT records or hostnames before analyzing.');
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('Could not read JSON. Check the brackets, commas, and quotes, then try again.');
    }
    return collectJsonNames(parsed);
  }
  return trimmed.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
}

function normalizeHostname(value: string): string | null {
  const hostname = value.trim().toLowerCase().replace(/^\*\./, '').replace(/\.+$/, '');
  if (!hostname || hostname.length > 253 || hostname.includes(':') || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return null;
  const labels = hostname.split('.');
  const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (labels.length < 2 || labels.some((label) => !labelPattern.test(label))) return null;
  return hostname;
}

export function filterFindings(names: string[], targetDomain: string): Finding[] {
  const domain = validateDomain(targetDomain);
  const unique = new Map<string, Finding>();
  for (const rawName of names) {
    const hostname = normalizeHostname(rawName);
    if (!hostname) continue;
    if (hostname !== domain && !hostname.endsWith(`.${domain}`)) continue;
    if (!unique.has(hostname)) {
      unique.set(hostname, {
        hostname,
        dnsStatus: 'Not checked',
        source: 'User-provided CT data',
      });
    }
  }
  return [...unique.values()].sort((a, b) => a.hostname.localeCompare(b.hostname));
}
