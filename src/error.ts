// pub(crate) enum ErrorKind {
//     UnexpectedEnd(Position),
//     UnexpectedChar(Position, char),
//     UnexpectedCharAfter(Position, char),
//     ExpectedCommaFound(Position, char),
//     LeadingZero(Position),
//     Overflow(Position),
//     EmptySegment(Position),
//     IllegalCharacter(Position),
//     WildcardNotTheOnlyComparator(char),
//     UnexpectedAfterWildcard,
//     ExcessiveComparators,
// }

export enum Position {
  Major = 'major version number',
  Minor = 'minor version number',
  Patch = 'patch version number',
  Pre = 'pre-release identifier',
  Build = 'build metadata',
}

export class UnexpectedEndError extends Error {
  public pos: Position;

  constructor(pos: Position) {
    const message = `unexpected end of input while parsing ${pos}`;
    super(message);
    this.name = 'UnexpectedEndError';
    this.pos = pos;
  }
}

export class UnexpectedChar extends Error {
  public pos: Position;
  public char: string;

  constructor(pos: Position, char: string) {
    const message = `unexpected character ${quoted(char)} while parsing ${pos}`;
    super(message);
    this.name = 'UnexpectedChar';
    this.pos = pos;
    this.char = char;
  }
}

export class UnexpectedCharAfterError extends Error {
  public pos: Position;
  public char: string;

  constructor(pos: Position, char: string) {
    const message = `unexpected character ${quoted(char)} after ${pos}`;
    super(message);
    this.name = 'UnexpectedCharAfterError';
    this.pos = pos;
    this.char = char;
  }
}

export class ExpectedCommaFoundError extends Error {
  public pos: Position;
  public char: string;

  constructor(pos: Position, char: string) {
    const message = `expected comma after ${pos}, found ${quoted(char)}`;
    super(message);
    this.name = 'ExpectedCommaFoundError';
    this.pos = pos;
    this.char = char;
  }
}

export class LeadingZeroError extends Error {
  public pos: Position;

  constructor(pos: Position) {
    const message = `invalid leading zero in ${pos}`;
    super(message);
    this.name = 'LeadingZeroError';
    this.pos = pos;
  }
}

export class EmptySegmentError extends Error {
  public pos: Position;

  constructor(pos: Position) {
    const message = `empty identifier segment in ${pos}`;
    super(message);
    this.name = 'EmptySegmentError';
    this.pos = pos;
  }
}

export class WildcardNotTheOnlyComparatorError extends Error {
  public char: string;

  constructor(char: string) {
    const message = `wildcard req (${char}) must be the only comparator in the version req`;
    super(message);
    this.name = 'WildcardNotTheOnlyComparatorError';
    this.char = char;
  }
}

export class UnexpectedAfterWildcardError extends Error {
  constructor() {
    const message = `unexpected character after wildcard in version req`;
    super(message);
    this.name = 'UnexpectedAfterWildcardError';
  }
}

export class ExcessiveComparatorsError extends Error {
  constructor() {
    const message = `excessive number of version comparators`;
    super(message);
    this.name = 'ExcessiveComparatorsError';
  }
}

function quoted(text: string): string {
  return text === '\0' ? "'\\0'" : `'${text}'`;
}
