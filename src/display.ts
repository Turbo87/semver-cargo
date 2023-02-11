import Version from './version';
import VersionReq, { Comparator } from './version_req';

export function format_version(v: Version) {
  let output = `${v.major}.${v.minor}.${v.patch}`;
  if (v.pre) {
    output += `-${v.pre}`;
  }
  if (v.build) {
    output += `+${v.build}`;
  }
  return output;
}

export function format_version_req(r: VersionReq) {
  if (r.comparators.length === 0) return '*';
  return r.comparators.map((c) => format_comparator(c)).join(', ');
}

export function format_comparator(c: Comparator) {
  const op =
    c.op === 'Exact'
      ? '='
      : c.op === 'Greater'
      ? '>'
      : c.op === 'GreaterEq'
      ? '>='
      : c.op === 'Less'
      ? '<'
      : c.op === 'LessEq'
      ? '<='
      : c.op === 'Tilde'
      ? '~'
      : c.op === 'Caret'
      ? '^'
      : '';

  let output = `${op}${c.major}`;
  if (c.minor !== null) {
    output += `.${c.minor}`;
    if (c.patch !== null) {
      output += `.${c.patch}`;
      if (c.pre) {
        output += `-${c.pre}`;
      }
    } else if (c.op == 'Wildcard') {
      output += '.*';
    }
  } else if (c.op == 'Wildcard') {
    output += '.*';
  }

  return output;
}
