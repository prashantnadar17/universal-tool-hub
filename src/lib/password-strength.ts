// Password strength scoring: length + variety + commonness penalty.
// Pure, no dependencies. Returns score 0-100 with label/color buckets.

export interface PasswordStrength {
  score: number; // 0-100
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  tone: "destructive" | "warning" | "info" | "success" | "primary";
  bits: number; // approx entropy bits
  reasons: string[];
}

// Tiny built-in list of obviously-common passwords / patterns.
const COMMON = new Set([
  "password", "passw0rd", "p@ssword", "p@ssw0rd",
  "123456", "12345678", "123456789", "1234567890",
  "qwerty", "qwerty123", "abc123", "letmein", "welcome",
  "admin", "root", "iloveyou", "monkey", "dragon",
  "111111", "000000", "654321", "sunshine", "princess",
  "football", "baseball", "master", "shadow", "michael",
]);

const SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function hasSequence(pwd: string, len = 4): boolean {
  const lower = pwd.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - len; i++) {
      const chunk = seq.slice(i, i + len);
      if (lower.includes(chunk) || lower.includes([...chunk].reverse().join(""))) return true;
    }
  }
  return false;
}

function hasRepeat(pwd: string, run = 3): boolean {
  return new RegExp(`(.)\\1{${run - 1},}`).test(pwd);
}

export function scorePassword(pwd: string): PasswordStrength {
  const reasons: string[] = [];
  if (!pwd) {
    return { score: 0, label: "Very weak", tone: "destructive", bits: 0, reasons: ["Empty"] };
  }

  const len = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /\d/.test(pwd);
  const hasSym = /[^A-Za-z0-9]/.test(pwd);

  // Approximate pool size for entropy
  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasNum) pool += 10;
  if (hasSym) pool += 32;
  if (pool === 0) pool = 26;

  const bits = Math.round(len * Math.log2(pool));

  // Base score from entropy bits (cap reasonable)
  let score = Math.min(100, Math.round((bits / 90) * 100));

  // Variety bonus
  const variety = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
  if (variety >= 4) score += 8;
  else if (variety === 3) score += 4;
  else if (variety <= 1) {
    score -= 15;
    reasons.push("Add more character types");
  }

  // Length bonuses / penalties
  if (len < 8) {
    score -= 30;
    reasons.push("Too short (use 12+)");
  } else if (len < 12) {
    reasons.push("Consider 12+ characters");
  } else if (len >= 16) {
    score += 5;
  }

  // Commonness / pattern penalties
  const lower = pwd.toLowerCase();
  if (COMMON.has(lower)) {
    score -= 60;
    reasons.push("Common password");
  } else {
    for (const c of COMMON) {
      if (lower.includes(c)) {
        score -= 25;
        reasons.push(`Contains common word "${c}"`);
        break;
      }
    }
  }
  if (hasRepeat(pwd)) {
    score -= 10;
    reasons.push("Repeated characters");
  }
  if (hasSequence(pwd)) {
    score -= 10;
    reasons.push("Keyboard / alphabet sequence");
  }

  score = Math.max(0, Math.min(100, score));

  let label: PasswordStrength["label"];
  let tone: PasswordStrength["tone"];
  if (score < 25) { label = "Very weak"; tone = "destructive"; }
  else if (score < 50) { label = "Weak"; tone = "warning"; }
  else if (score < 70) { label = "Fair"; tone = "info"; }
  else if (score < 90) { label = "Strong"; tone = "success"; }
  else { label = "Very strong"; tone = "primary"; }

  return { score, label, tone, bits, reasons };
}
