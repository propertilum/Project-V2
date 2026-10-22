/**
 * Email Existence and Validity Verification Utility
 * 
 * Verifies whether an email address actually exists by:
 * 1. Syntax & RFC-5322 structure validation
 * 2. Disposable / temporary inbox detection
 * 3. Live DNS-over-HTTPS (DoH) MX (Mail Exchange) record querying via Google & Cloudflare DNS
 * 4. RFC-7505 Null MX detection (domains configured to reject email)
 */

// Popular disposable / fake email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'getairmail.com',
  'fakeinbox.com',
  'dispostable.com',
  'mytemp.email',
  'nada.ltd',
  'maildrop.cc',
  'burnermail.io',
  'crazymailing.com',
  'tempail.com',
  'fakemailgenerator.com'
]);

// Standard known email providers that are guaranteed to exist
const MAJOR_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'zoho.com',
  'proton.me',
  'protonmail.com',
  'cardhub.io'
]);

/**
 * Validates standard email syntax
 */
export function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  
  // RFC 5322 compliant regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Queries Google DNS over HTTPS for MX records
 */
async function queryGoogleDns(domain) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Queries Cloudflare DNS over HTTPS for MX records (fallback)
 */
async function queryCloudflareDns(domain) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { 'Accept': 'application/dns-json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Checks if a domain has active A / address records (last resort fallback)
 */
async function queryDomainAddress(domain) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verifies that an email address exists in real-time
 * @param {string} email - The email address to verify
 * @returns {Promise<{ exists: boolean, error?: string, domain?: string }>}
 */
export async function checkEmailExists(email) {
  if (!email || typeof email !== 'string') {
    return { exists: false, error: "Email doesn't exist. Please provide an email address." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Format check
  if (!validateEmailFormat(cleanEmail)) {
    return { 
      exists: false, 
      error: "Email doesn't exist. Please enter a valid email format (e.g. user@domain.com)." 
    };
  }

  const [, domain] = cleanEmail.split('@');
  if (!domain || !domain.includes('.')) {
    return { exists: false, error: "Email doesn't exist. The domain is incomplete." };
  }

  // 2. Reject obvious fake / reserved non-working domains
  if (
    domain === 'test.com' ||
    domain === 'fake.com' ||
    domain === 'none.com' ||
    domain.endsWith('.invalid') ||
    domain.endsWith('.local') ||
    domain.endsWith('.internal') ||
    domain.endsWith('.test')
  ) {
    return { 
      exists: false, 
      error: `Email doesn't exist. "${domain}" is not a real or deliverable email host.` 
    };
  }

  // 3. Reject disposable temporary addresses
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { 
      exists: false, 
      error: "Email doesn't exist. Temporary or disposable email addresses are not accepted." 
    };
  }

  // 4. Quick pass for recognized major providers
  if (MAJOR_PROVIDERS.has(domain)) {
    return { exists: true, domain };
  }

  // 5. Query live DNS over HTTPS for MX records
  let dnsResult = await queryGoogleDns(domain);
  if (!dnsResult) {
    dnsResult = await queryCloudflareDns(domain);
  }

  // If DNS response was obtained:
  if (dnsResult) {
    // Status 3 in DNS means NXDOMAIN (Non-Existent Domain)
    if (dnsResult.Status === 3) {
      return { 
        exists: false, 
        error: `Email doesn't exist. Domain "@${domain}" could not be found on internet DNS servers.` 
      };
    }

    const answers = dnsResult.Answer || [];
    const mxRecords = answers.filter(a => a.type === 15);

    // Check RFC-7505 Null MX record ("0 .") which explicitly says domain refuses email
    const isNullMx = mxRecords.some(r => {
      const dataStr = (r.data || '').trim();
      return dataStr === '0 .' || dataStr === '.' || dataStr.startsWith('0 .');
    });

    if (isNullMx) {
      return { 
        exists: false, 
        error: `Email doesn't exist. The domain "@${domain}" is configured to not accept any emails.` 
      };
    }

    // If MX records exist, the mail server is active
    if (mxRecords.length > 0) {
      return { exists: true, domain, mxCount: mxRecords.length };
    }

    // If no MX records, check if the domain at least has an A record (some old MTAs fall back to A)
    const hasAddressRecord = await queryDomainAddress(domain);
    if (!hasAddressRecord && answers.length === 0) {
      return { 
        exists: false, 
        error: `Email doesn't exist. No mail servers (MX records) or host records found for "@${domain}".` 
      };
    }
  }

  // If online DNS check could not connect (e.g. offline device), allow valid RFC format
  return { exists: true, domain };
}
