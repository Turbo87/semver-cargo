export function comparePre(a: string, b: string): number {
  if (a === '' && b === '') return 0;
  if (a === '') return 1;
  if (b === '') return -1;

  const aParts = a.split('.');
  const bParts = b.split('.');

  for (let i = 0; i < aParts.length; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    // Spec: "A larger set of pre-release fields has a higher
    // precedence than a smaller set, if all of the preceding
    // identifiers are equal."
    if (!bPart) return 1;

    const aAllDigits = /^\d$/.test(aPart);
    const bAllDigits = /^\d$/.test(bPart);

    if (aAllDigits && !bAllDigits) return -1;
    if (!aAllDigits && bAllDigits) return 1;

    if (aAllDigits && bAllDigits) {
      const aLen = aPart.length;
      const bLen = bPart.length;
      if (aLen > bLen) return 1;
      if (aLen < bLen) return -1;
    }

    const stringOrder = aPart.localeCompare(bPart);
    if (stringOrder !== 0) return stringOrder;
  }

  if (aParts.length < bParts.length) {
    return -1;
  } else {
    return 0;
  }
}

export function compareBuild(a: string, b: string): number {
  if (a === '' && b === '') return 0;
  if (a === '') return 1;
  if (b === '') return -1;

  const aParts = a.split('.');
  const bParts = b.split('.');

  for (let i = 0; i < aParts.length; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    // Spec: "A larger set of pre-release fields has a higher
    // precedence than a smaller set, if all of the preceding
    // identifiers are equal."
    if (!bPart) return 1;

    const aAllDigits = /^\d$/.test(aPart);
    const bAllDigits = /^\d$/.test(bPart);

    if (aAllDigits && !bAllDigits) return -1;
    if (!aAllDigits && bAllDigits) return 1;

    if (aAllDigits && bAllDigits) {
      const aTrimmed = aPart.replace(/^0+/, '');
      const bTrimmed = bPart.replace(/^0+/, '');

      const aTrimmedLen = aTrimmed.length;
      const bTrimmedLen = bTrimmed.length;
      if (aTrimmedLen > bTrimmedLen) return 1;
      if (aTrimmedLen < bTrimmedLen) return -1;

      const stringOrder = aTrimmed.localeCompare(bTrimmed);
      if (stringOrder !== 0) return stringOrder;

      const aLen = aPart.length;
      const bLen = bPart.length;
      if (aLen > bLen) return 1;
      if (aLen < bLen) return -1;
    }

    const stringOrder = aPart.localeCompare(bPart);
    if (stringOrder !== 0) return stringOrder;
  }

  if (aParts.length < bParts.length) {
    return -1;
  } else {
    return 0;
  }
}
