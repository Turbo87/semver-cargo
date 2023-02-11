import Version from './version';
import {
  EmptySegmentError,
  LeadingZeroError,
  Position,
  UnexpectedChar,
  UnexpectedCharAfterError,
  UnexpectedEndError,
} from './error';

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

// impl FromStr for VersionReq {
//     type Err = Error;
//
//     fn from_str(text: &str) -> Result<Self, Self::Err> {
//         let text = text.trim_start_matches(' ');
//         if let Some((ch, text)) = wildcard(text) {
//             let rest = text.trim_start_matches(' ');
//             if rest.is_empty() {
//                 #[cfg(not(no_const_vec_new))]
//                 return Ok(VersionReq::STAR);
//                 #[cfg(no_const_vec_new)] // rustc <1.39
//                 return Ok(VersionReq {
//                     comparators: Vec::new(),
//                 });
//             } else if rest.starts_with(',') {
//                 return Err(Error::new(ErrorKind::WildcardNotTheOnlyComparator(ch)));
//             } else {
//                 return Err(Error::new(ErrorKind::UnexpectedAfterWildcard));
//             }
//         }
//
//         let depth = 0;
//         let mut comparators = Vec::new();
//         let len = version_req(text, &mut comparators, depth)?;
//         unsafe { comparators.set_len(len) }
//         Ok(VersionReq { comparators })
//     }
// }
//
// impl FromStr for Comparator {
//     type Err = Error;
//
//     fn from_str(text: &str) -> Result<Self, Self::Err> {
//         let text = text.trim_start_matches(' ');
//         let (comparator, pos, rest) = comparator(text)?;
//         if !rest.is_empty() {
//             let unexpected = rest.chars().next().unwrap();
//             return Err(Error::new(ErrorKind::UnexpectedCharAfter(pos, unexpected)));
//         }
//         Ok(comparator)
//     }
// }
//
// impl FromStr for Prerelease {
//     type Err = Error;
//
//     fn from_str(text: &str) -> Result<Self, Self::Err> {
//         let (pre, rest) = prerelease_identifier(text)?;
//         if !rest.is_empty() {
//             return Err(Error::new(ErrorKind::IllegalCharacter(Position.Pre)));
//         }
//         Ok(pre)
//     }
// }
//
// impl FromStr for BuildMetadata {
//     type Err = Error;
//
//     fn from_str(text: &str) -> Result<Self, Self::Err> {
//         let (build, rest) = build_identifier(text)?;
//         if !rest.is_empty() {
//             return Err(Error::new(ErrorKind::IllegalCharacter(Position.Build)));
//         }
//         Ok(build)
//     }
// }
//
// impl Error {
//     fn new(kind: ErrorKind) -> Self {
//         Error { kind }
//     }
// }
//
// impl Op {
//     const DEFAULT: Self = Op::Caret;
// }

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

// fn wildcard(input: &str) -> Option<(char, &str)> {
//     if let Some(rest) = input.strip_prefix('*') {
//         Some(('*', rest))
//     } else if let Some(rest) = input.strip_prefix('x') {
//         Some(('x', rest))
//     } else if let Some(rest) = input.strip_prefix('X') {
//         Some(('X', rest))
//     } else {
//         None
//     }
// }

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

// fn op(input: &str) -> (Op, &str) {
//     let bytes = input.as_bytes();
//     if bytes.first() == Some(&b'=') {
//         (Op::Exact, &input[1..])
//     } else if bytes.first() == Some(&b'>') {
//         if bytes.get(1) == Some(&b'=') {
//             (Op::GreaterEq, &input[2..])
//         } else {
//             (Op::Greater, &input[1..])
//         }
//     } else if bytes.first() == Some(&b'<') {
//         if bytes.get(1) == Some(&b'=') {
//             (Op::LessEq, &input[2..])
//         } else {
//             (Op::Less, &input[1..])
//         }
//     } else if bytes.first() == Some(&b'~') {
//         (Op::Tilde, &input[1..])
//     } else if bytes.first() == Some(&b'^') {
//         (Op::Caret, &input[1..])
//     } else {
//         (Op::DEFAULT, input)
//     }
// }
//
// fn comparator(input: &str) -> Result<(Comparator, Position, &str), Error> {
//     let (mut op, text) = op(input);
//     let default_op = input.len() == text.len();
//     let text = text.trim_start_matches(' ');
//
//     let mut pos = Position.Major;
//     let (major, text) = numeric_identifier(text, pos)?;
//     let mut has_wildcard = false;
//
//     let (minor, text) = if let Some(text) = text.strip_prefix('.') {
//         pos = Position.Minor;
//         if let Some((_, text)) = wildcard(text) {
//             has_wildcard = true;
//             if default_op {
//                 op = Op::Wildcard;
//             }
//             (None, text)
//         } else {
//             let (minor, text) = numeric_identifier(text, pos)?;
//             (Some(minor), text)
//         }
//     } else {
//         (None, text)
//     };
//
//     let (patch, text) = if let Some(text) = text.strip_prefix('.') {
//         pos = Position.Patch;
//         if let Some((_, text)) = wildcard(text) {
//             if default_op {
//                 op = Op::Wildcard;
//             }
//             (None, text)
//         } else if has_wildcard {
//             return Err(Error::new(ErrorKind::UnexpectedAfterWildcard));
//         } else {
//             let (patch, text) = numeric_identifier(text, pos)?;
//             (Some(patch), text)
//         }
//     } else {
//         (None, text)
//     };
//
//     let (pre, text) = if patch.is_some() && text.starts_with('-') {
//         pos = Position.Pre;
//         let text = &text[1..];
//         let (pre, text) = prerelease_identifier(text)?;
//         if pre.is_empty() {
//             return Err(Error::new(ErrorKind::EmptySegment(pos)));
//         }
//         (pre, text)
//     } else {
//         (Prerelease::EMPTY, text)
//     };
//
//     let text = if patch.is_some() && text.starts_with('+') {
//         pos = Position.Build;
//         let text = &text[1..];
//         let (build, text) = build_identifier(text)?;
//         if build.is_empty() {
//             return Err(Error::new(ErrorKind::EmptySegment(pos)));
//         }
//         text
//     } else {
//         text
//     };
//
//     let text = text.trim_start_matches(' ');
//
//     let comparator = Comparator {
//         op,
//         major,
//         minor,
//         patch,
//         pre,
//     };
//
//     Ok((comparator, pos, text))
// }
//
// fn version_req(input: &str, out: &mut Vec<Comparator>, depth: usize) -> Result<usize, Error> {
//     let (comparator, pos, text) = match comparator(input) {
//         Ok(success) => success,
//         Err(mut error) => {
//             if let Some((ch, mut rest)) = wildcard(input) {
//                 rest = rest.trim_start_matches(' ');
//                 if rest.is_empty() || rest.starts_with(',') {
//                     error.kind = ErrorKind::WildcardNotTheOnlyComparator(ch);
//                 }
//             }
//             return Err(error);
//         }
//     };
//
//     if text.is_empty() {
//         out.reserve_exact(depth + 1);
//         unsafe { out.as_mut_ptr().add(depth).write(comparator) }
//         return Ok(depth + 1);
//     }
//
//     let text = if let Some(text) = text.strip_prefix(',') {
//         text.trim_start_matches(' ')
//     } else {
//         let unexpected = text.chars().next().unwrap();
//         return Err(Error::new(ErrorKind::ExpectedCommaFound(pos, unexpected)));
//     };
//
//     const MAX_COMPARATORS: usize = 32;
//     if depth + 1 == MAX_COMPARATORS {
//         return Err(Error::new(ErrorKind::ExcessiveComparators));
//     }
//
//     // Recurse to collect parsed Comparator objects on the stack. We perform a
//     // single allocation to allocate exactly the right sized Vec only once the
//     // total number of comparators is known.
//     let len = version_req(text, out, depth + 1)?;
//     unsafe { out.as_mut_ptr().add(depth).write(comparator) }
//     Ok(len)
// }
