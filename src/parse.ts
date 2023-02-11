import {
  EmptySegmentError,
  ExcessiveComparatorsError,
  ExpectedCommaFoundError,
  LeadingZeroError,
  Position,
  UnexpectedAfterWildcardError,
  UnexpectedChar,
  UnexpectedCharAfterError,
  UnexpectedEndError,
  WildcardNotTheOnlyComparatorError,
} from './error';
import Version from './version';
import VersionReq, { Comparator, Op } from './version_req';

export function parse_version(text: string): Version {
  let major: number, minor: number, patch: number;

  [major, text] = numeric_identifier(text, Position.Major);
  text = dot(text, Position.Major);

  [minor, text] = numeric_identifier(text, Position.Minor);
  text = dot(text, Position.Minor);

  [patch, text] = numeric_identifier(text, Position.Patch);

  if (text === '') {
    return new Version(major, minor, patch);
  }

  let pre = '';
  if (text[0] === '-') {
    [pre, text] = identifier(text.slice(1), Position.Pre);
    if (pre === '') {
      throw new EmptySegmentError(Position.Pre);
    }
  }

  let build = '';
  if (text[0] === '+') {
    [build, text] = identifier(text.slice(1), Position.Build);
    if (build === '') {
      throw new EmptySegmentError(Position.Build);
    }
  }

  if (text !== '') {
    let pos;
    if (build) {
      pos = Position.Build;
    } else if (pre) {
      pos = Position.Pre;
    } else {
      pos = Position.Patch;
    }

    throw new UnexpectedCharAfterError(pos, text[0]);
  }

  return new Version(major, minor, patch, pre, build);
}

export function parse_version_req(text: string): VersionReq {
  text = text.replace(/^ +/, '');

  const wc = wildcard(text);
  if (wc) {
    const rest = wc[1].replace(/^ +/, '');
    if (rest === '') {
      return VersionReq.STAR;
    } else if (rest[0] === ',') {
      throw new WildcardNotTheOnlyComparatorError(wc[0]);
    } else {
      throw new UnexpectedAfterWildcardError();
    }
  }

  const depth = 0;
  const comparators = [];
  version_req(text, comparators, depth);
  return new VersionReq(comparators);
}

export function parse_comparator(text: string): Comparator {
  text = text.replace(/^ +/, '');

  const [comp, pos, rest] = comparator(text);
  if (rest !== '') {
    throw new UnexpectedCharAfterError(pos, rest[0]);
  }

  return comp;
}

function numeric_identifier(input: string, pos: Position): [number, string] {
  const ZERO = '0'.charCodeAt(0);
  const NINE = '9'.charCodeAt(0);

  let len = 0;
  let value = 0;

  let digit: number;
  while ((digit = input.charCodeAt(len))) {
    if (digit < ZERO || digit > NINE) {
      break;
    }
    if (value == 0 && len > 0) {
      throw new LeadingZeroError(pos);
    }
    value = value * 10 + (digit - ZERO);
    len += 1;
  }

  if (len > 0) {
    return [value, input.slice(len)];
  } else if (input !== '') {
    throw new UnexpectedChar(pos, input.slice(len, len + 1));
  } else {
    throw new UnexpectedEndError(pos);
  }
}

function wildcard(input: string): [string, string] | null {
  const next = input[0];
  return next === '*' || next === 'x' || next === 'X'
    ? [next, input.slice(1)]
    : null;
}

function dot(input: string, pos: Position): string {
  const next = input[0];
  if (next === '.') {
    return input.slice(1);
  } else if (next === undefined) {
    throw new UnexpectedEndError(pos);
  } else {
    throw new UnexpectedCharAfterError(pos, next);
  }
}

function identifier(input: string, pos: Position): [string, string] {
  let accumulated_len = 0;
  let segment_len = 0;
  let segment_has_nondigit = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const char = input.charCodeAt(accumulated_len + segment_len);
    if (
      (char >= 'A'.charCodeAt(0) && char <= 'Z'.charCodeAt(0)) ||
      (char >= 'a'.charCodeAt(0) && char <= 'z'.charCodeAt(0)) ||
      char === '-'.charCodeAt(0)
    ) {
      segment_len += 1;
      segment_has_nondigit = true;
    } else if (char >= '0'.charCodeAt(0) && char <= '9'.charCodeAt(0)) {
      segment_len += 1;
    } else {
      if (segment_len == 0) {
        if (accumulated_len === 0 && char !== '.'.charCodeAt(0)) {
          return ['', input];
        } else {
          throw new EmptySegmentError(pos);
        }
      }
      if (
        pos == Position.Pre &&
        segment_len > 1 &&
        !segment_has_nondigit &&
        input[accumulated_len] === '0'
      ) {
        throw new LeadingZeroError(pos);
      }
      accumulated_len += segment_len;
      if (char === '.'.charCodeAt(0)) {
        accumulated_len += 1;
        segment_len = 0;
        segment_has_nondigit = false;
      } else {
        return [input.slice(0, accumulated_len), input.slice(accumulated_len)];
      }
    }
  }
}

function op_(input: string): [Op, string] {
  const ch1 = input[0];
  const ch2 = input[1];
  if (ch1 === '=') {
    return ['Exact', input.slice(1)];
  } else if (ch1 === '>') {
    if (ch2 === '=') {
      return ['GreaterEq', input.slice(2)];
    } else {
      return ['Greater', input.slice(1)];
    }
  } else if (ch1 === '<') {
    if (ch2 === '=') {
      return ['LessEq', input.slice(2)];
    } else {
      return ['Less', input.slice(1)];
    }
  } else if (ch1 === '~') {
    return ['Tilde', input.slice(1)];
  } else if (ch1 === '^') {
    return ['Caret', input.slice(1)];
  } else {
    return ['Caret', input];
  }
}

function comparator(input: string): [Comparator, Position, string] {
  let [op, text] = op_(input);
  const isDefaultOp = input.length == text.length;

  text = text.replace(/^ +/, '');

  let major: number;
  let pos = Position.Major;
  // eslint-disable-next-line prefer-const
  [major, text] = numeric_identifier(text, pos);
  let hasWildcard = false;

  let minor = null;
  if (text[0] === '.') {
    text = text.slice(1);
    pos = Position.Minor;

    const wc = wildcard(text);
    if (wc) {
      hasWildcard = true;
      if (isDefaultOp) {
        op = 'Wildcard';
      }
      text = wc[1];
    } else {
      [minor, text] = numeric_identifier(text, pos);
    }
  }

  let patch = null;
  if (text[0] === '.') {
    text = text.slice(1);
    pos = Position.Patch;

    const wc = wildcard(text);
    if (wc) {
      if (isDefaultOp) {
        op = 'Wildcard';
      }
      text = wc[1];
    } else if (hasWildcard) {
      throw new UnexpectedAfterWildcardError();
    } else {
      [patch, text] = numeric_identifier(text, pos);
    }
  }

  let pre = '';
  if (patch !== null && text[0] === '-') {
    pos = Position.Pre;
    text = text.slice(1);
    [pre, text] = identifier(text, pos);
    if (pre === '') {
      throw new EmptySegmentError(pos);
    }
  }

  let build = '';
  if (patch !== null && text[0] === '+') {
    pos = Position.Build;
    text = text.slice(1);
    [build, text] = identifier(text, pos);
    if (build === '') {
      throw new EmptySegmentError(pos);
    }
  }

  text = text.replace(/^ +/, '');

  const comparator = new Comparator(op, major, minor, patch, pre);
  return [comparator, pos, text];
}

function version_req(input: string, out: Comparator[], depth: number): number {
  let comp, pos, text;
  try {
    [comp, pos, text] = comparator(input);
  } catch (error) {
    const wc = wildcard(input);
    if (wc) {
      const rest = wc[1].replace(/^ +/, '');
      if (rest === '' || rest[0] === ',') {
        throw new WildcardNotTheOnlyComparatorError(wc[0]);
      }
    }

    throw error;
  }

  if (text === '') {
    out.push(comp);
    return depth + 1;
  }

  if (text[0] !== ',') {
    const unexpected = text[0];
    throw new ExpectedCommaFoundError(pos, unexpected);
  }

  text = text.replace(/^, */, '');

  const MAX_COMPARATORS = 32;
  if (depth + 1 == MAX_COMPARATORS) {
    throw new ExcessiveComparatorsError();
  }

  out.push(comp);

  return version_req(text, out, depth + 1);
}
