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
    const message = `unexpected character '${char}' while parsing ${pos}`;
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
    const message = `unexpected character '${char}' after ${pos}`;
    super(message);
    this.name = 'UnexpectedCharAfterError';
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

// #[cfg(feature = "std")]
// #[cfg_attr(doc_cfg, doc(cfg(feature = "std")))]
// impl std::error::Error for Error {}
//
// impl Display for Error {
//     fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
//         match &self.kind {
//             ErrorKind::ExpectedCommaFound(pos, ch) => {
//                 write!(
//                     formatter,
//                     "expected comma after {}, found {}",
//                     pos,
//                     QuotedChar(*ch),
//                 )
//             }
//             ErrorKind::LeadingZero(pos) => {
//                 write!(formatter, "invalid leading zero in {}", pos)
//             }
//             ErrorKind::Overflow(pos) => {
//                 write!(formatter, "value of {} exceeds u64::MAX", pos)
//             }
//             ErrorKind::EmptySegment(pos) => {
//                 write!(formatter, "empty identifier segment in {}", pos)
//             }
//             ErrorKind::IllegalCharacter(pos) => {
//                 write!(formatter, "unexpected character in {}", pos)
//             }
//             ErrorKind::WildcardNotTheOnlyComparator(ch) => {
//                 write!(
//                     formatter,
//                     "wildcard req ({}) must be the only comparator in the version req",
//                     ch,
//                 )
//             }
//             ErrorKind::UnexpectedAfterWildcard => {
//                 formatter.write_str("unexpected character after wildcard in version req")
//             }
//             ErrorKind::ExcessiveComparators => {
//                 formatter.write_str("excessive number of version comparators")
//             }
//         }
//     }
// }
//
// impl Display for Position {
//     fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
//         formatter.write_str(match self {
//             Position::Major => "major version number",
//             Position::Minor => "minor version number",
//             Position::Patch => "patch version number",
//             Position::Pre => "pre-release identifier",
//             Position::Build => "build metadata",
//         })
//     }
// }
//
// impl Debug for Error {
//     fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
//         formatter.write_str("Error(\"")?;
//         Display::fmt(self, formatter)?;
//         formatter.write_str("\")")?;
//         Ok(())
//     }
// }
//
// struct QuotedChar(char);
//
// impl Display for QuotedChar {
//     fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
//         // Standard library versions prior to https://github.com/rust-lang/rust/pull/95345
//         // print character 0 as '\u{0}'. We prefer '\0' to keep error messages
//         // the same across all supported Rust versions.
//         if self.0 == '\0' {
//             formatter.write_str("'\\0'")
//         } else {
//             write!(formatter, "{:?}", self.0)
//         }
//     }
// }
