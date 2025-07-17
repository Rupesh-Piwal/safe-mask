// import { PIITag } from "@/app/types";

import { PIITag } from "@/app/types";

// // lib/regexUtils.ts
// // export interface PIITag {
// //   type: string;
// //   value: string;
// //   startIndex: number;
// //   endIndex: number;
// //   confidence: number;
// // }

// // Regex patterns for different PII types
// const PII_PATTERNS = {
//   email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
//   phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
//   ssn: /\b(?:\d{3}-\d{2}-\d{4}|\d{9})\b/g,
//   creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
//   name: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, // Simple name pattern
//   address: /\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
//   zipCode: /\b\d{5}(?:-\d{4})?\b/g,
//   dateOfBirth: /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,
//   ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
//   url: /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?/g,
//   driverLicense: /\b[A-Z]{1,2}\d{6,8}\b/g,
//   passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
//   bankAccount: /\b\d{8,17}\b/g,
//   medicalRecord: /\b(?:MRN|MR|Medical Record):?\s*\d{6,10}\b/gi,
//   nationalId: /\b(?:NID|National ID):?\s*\d{8,15}\b/gi,
// };

// export function detectPII(text: string): PIITag[] {
//   const tags: PIITag[] = [];

//   for (const { label, regex } of PII_PATTERNS) {
//     const matches = [...text.matchAll(regex)];

//     for (const match of matches) {
//       tags.push({
//         match: match[0],
//         start: match.index ?? 0,
//         end: (match.index ?? 0) + match[0].length,
//         entity: match[0], // You can change this if "entity" means something else in your context
//         text: text, // Full OCR text context for this match
//         label: label as PIITag["label"],
//       });
//     }
//   }

//   return tags;
// }

// lib/regexUtils.ts

// Regex patterns for different PII types
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  ssn: /\b(?:\d{3}-\d{2}-\d{4}|\d{9})\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  name: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, // Simple name pattern
  address:
    /\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
  dateOfBirth:
    /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,
  ipAddress:
    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  url: /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?/g,
  driverLicense: /\b[A-Z]{1,2}\d{6,8}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  bankAccount: /\b\d{8,17}\b/g,
  medicalRecord: /\b(?:MRN|MR|Medical Record):?\s*\d{6,10}\b/gi,
  nationalId: /\b(?:NID|National ID):?\s*\d{8,15}\b/gi,
};

export function detectPII(text: string): PIITag[] {
  const piiTags: PIITag[] = [];

  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    let match;
    const regex = new RegExp(pattern);

    while ((match = regex.exec(text)) !== null) {
      // Skip if it's a common word that matches name pattern
      if (type === "name" && isCommonWord(match[0])) {
        continue;
      }

      // Skip if it's a generic number that matches other patterns
      if (
        ["bankAccount", "driverLicense"].includes(type) &&
        isGenericNumber(match[0])
      ) {
        continue;
      }

      piiTags.push({
        type,
        text: text,
        value: match[0],
        startIndex: match.index!,
        endIndex: match.index! + match[0].length,
        confidence: calculateConfidence(type, match[0]),
      });
    }
  });

  // Remove overlapping matches (keep the one with higher confidence)
  return removeOverlappingMatches(piiTags);
}

function calculateConfidence(type: string, value: string): number {
  switch (type) {
    case "email":
      return value.includes("@") && value.includes(".") ? 0.95 : 0.7;
    case "phone":
      return value.replace(/\D/g, "").length === 10 ? 0.9 : 0.7;
    case "ssn":
      return value.replace(/\D/g, "").length === 9 ? 0.95 : 0.7;
    case "creditCard":
      return isValidCreditCard(value) ? 0.9 : 0.6;
    case "name":
      return 0.6; // Names are harder to detect with high confidence
    case "address":
      return 0.8;
    case "zipCode":
      return 0.85;
    case "dateOfBirth":
      return 0.8;
    case "ipAddress":
      return 0.9;
    case "url":
      return 0.95;
    default:
      return 0.7;
  }
}

function isCommonWord(word: string): boolean {
  const commonWords = [
    "The Best",
    "New York",
    "Los Angeles",
    "San Francisco",
    "John Doe",
    "Jane Smith",
  ];
  return commonWords.includes(word);
}

function isGenericNumber(value: string): boolean {
  const cleanValue = value.replace(/\D/g, "");
  // Skip obvious patterns like 000000000, 111111111, etc.
  return /^(\d)\1+$/.test(cleanValue) || cleanValue.length < 6;
}

function isValidCreditCard(value: string): boolean {
  const cleanValue = value.replace(/\D/g, "");
  // Basic Luhn algorithm check
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanValue.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanValue.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function removeOverlappingMatches(piiTags: PIITag[]): PIITag[] {
  // Sort by start index
  const sorted = piiTags.sort((a, b) => a.startIndex - b.startIndex);
  const result: PIITag[] = [];

  for (const tag of sorted) {
    const overlapping = result.find(
      (existing) =>
        tag.startIndex < existing.endIndex && tag.endIndex > existing.startIndex
    );

    if (!overlapping) {
      result.push(tag);
    } else if (tag.confidence > overlapping.confidence) {
      // Replace with higher confidence match
      const index = result.indexOf(overlapping);
      result[index] = tag;
    }
  }

  return result;
}
