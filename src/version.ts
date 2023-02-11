import { parse_version } from './parse';

/**
 * **SemVer version** as defined by <https://semver.org>.
 *
 * # Syntax
 *
 * - The major, minor, and patch numbers may be any integer 0 through u64::MAX.
 *   When representing a SemVer version as a string, each number is written as
 *   a base 10 integer. For example, `1.0.119`.
 *
 * - Leading zeros are forbidden in those positions. For example `1.01.00` is
 *   invalid as a SemVer version.
 *
 * - The pre-release identifier, if present, must conform to the syntax
 *   documented for [`Prerelease`].
 *
 * - The build metadata, if present, must conform to the syntax documented for
 *   [`BuildMetadata`].
 *
 * - Whitespace is not allowed anywhere in the version.
 *
 * # Total ordering
 *
 * Given any two SemVer versions, one is less than, greater than, or equal to
 * the other. Versions may be compared against one another using Rust's usual
 * comparison operators.
 *
 * - The major, minor, and patch number are compared numerically from left to
 * right, lexicographically ordered as a 3-tuple of integers. So for example
 * version `1.5.0` is less than version `1.19.0`, despite the fact that
 * "1.19.0" &lt; "1.5.0" as ASCIIbetically compared strings and 1.19 &lt; 1.5
 * as real numbers.
 *
 * - When major, minor, and patch are equal, a pre-release version is
 *   considered less than the ordinary release:&ensp;version `1.0.0-alpha.1` is
 *   less than version `1.0.0`.
 *
 * - Two pre-releases of the same major, minor, patch are compared by
 *   lexicographic ordering of dot-separated components of the pre-release
 *   string.
 *
 *   - Identifiers consisting of only digits are compared
 *     numerically:&ensp;`1.0.0-pre.8` is less than `1.0.0-pre.12`.
 *
 *   - Identifiers that contain a letter or hyphen are compared in ASCII sort
 *     order:&ensp;`1.0.0-pre12` is less than `1.0.0-pre8`.
 *
 *   - Any numeric identifier is always less than any non-numeric
 *     identifier:&ensp;`1.0.0-pre.1` is less than `1.0.0-pre.x`.
 *
 * Example:&ensp;`1.0.0-alpha`&ensp;&lt;&ensp;`1.0.0-alpha.1`&ensp;&lt;&ensp;`1.0.0-alpha.beta`&ensp;&lt;&ensp;`1.0.0-beta`&ensp;&lt;&ensp;`1.0.0-beta.2`&ensp;&lt;&ensp;`1.0.0-beta.11`&ensp;&lt;&ensp;`1.0.0-rc.1`&ensp;&lt;&ensp;`1.0.0`
 */
export default class Version {
  public major: number;
  public minor: number;
  public patch: number;
  public pre: string;
  public build: string;

  constructor(
    major: number,
    minor: number,
    patch: number,
    pre = '',
    build = ''
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.pre = pre;
    this.build = build;
  }

  /**
   * Create `Version` by parsing from string representation.
   *
   * # Errors
   *
   * Possible reasons for the parse to fail include:
   *
   * - `1.0` &mdash; too few numeric components. A SemVer version must have
   *   exactly three. If you are looking at something that has fewer than
   *   three numbers in it, it's possible it is a `VersionReq` instead (with
   *   an implicit default `^` comparison operator).
   *
   * - `1.0.01` &mdash; a numeric component has a leading zero.
   *
   * - `1.0.unknown` &mdash; unexpected character in one of the components.
   *
   * - `1.0.0-` or `1.0.0+` &mdash; the pre-release or build metadata are
   *   indicated present but empty.
   *
   * - `1.0.0-alpha_123` &mdash; pre-release or build metadata have something
   *   outside the allowed characters, which are `0-9`, `A-Z`, `a-z`, `-`,
   *   and `.` (dot).
   *
   * - `23456789999999999999.0.0` &mdash; overflow of a u64.
   */
  static parse(text: string): Version {
    return parse_version(text);
  }

  toString(): string {
    let output = `${this.major}.${this.minor}.${this.patch}`;
    if (this.pre) {
      output += `-${this.pre}`;
    }
    if (this.build) {
      output += `+${this.build}`;
    }
    return output;
  }
}
