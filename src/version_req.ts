import Version from './version';
import { parse_comparator, parse_version_req } from './parse';
import { format_comparator, format_version_req } from './display';
import { matches_comparator, matches_req } from './eval';

/**
 * **SemVer version requirement** describing the intersection of some version
 * comparators, such as `>=1.2.3, <1.8`.
 *
 * # Syntax
 *
 * - Either `*` (meaning "any"), or one or more comma-separated comparators.
 *
 * - A [`Comparator`] is an operator ([`Op`]) and a partial version, separated
 *   by optional whitespace. For example `>=1.0.0` or `>=1.0`.
 *
 * - Build metadata is syntactically permitted on the partial versions, but is
 *   completely ignored, as it's never relevant to whether any comparator
 *   matches a particular version.
 *
 * - Whitespace is permitted around commas and around operators. Whitespace is
 *   not permitted within a partial version, i.e. anywhere between the major
 *   version number and its minor, patch, pre-release, or build metadata.
 */
export default class VersionReq {
  public comparators: Comparator[];

  /**
   * A `VersionReq` with no constraint on the version numbers it matches.
   * Equivalent to `VersionReq::parse("*").unwrap()`.
   *
   * In terms of comparators this is equivalent to `>=0.0.0`.
   *
   * Counterintuitively a `*` VersionReq does not match every possible
   * version number. In particular, in order for *any* `VersionReq` to match
   * a pre-release version, the `VersionReq` must contain at least one
   * `Comparator` that has an explicit major, minor, and patch version
   * identical to the pre-release being matched, and that has a nonempty
   * pre-release component. Since `*` is not written with an explicit major,
   * minor, and patch version, and does not contain a nonempty pre-release
   * component, it does not match any pre-release versions.
   */
  public static STAR = new VersionReq([]);

  constructor(comparators: Comparator[]) {
    this.comparators = comparators;
  }

  /**
   * Create `VersionReq` by parsing from string representation.
   *
   * # Errors
   *
   * Possible reasons for the parse to fail include:
   *
   * - `>a.b` &mdash; unexpected characters in the partial version.
   *
   * - `@1.0.0` &mdash; unrecognized comparison operator.
   *
   * - `^1.0.0, ` &mdash; unexpected end of input.
   *
   * - `>=1.0 <2.0` &mdash; missing comma between comparators.
   *
   * - `*.*` &mdash; unsupported wildcard syntax.
   */
  static parse(text: string): VersionReq {
    return parse_version_req(text);
  }

  toString(): string {
    return format_version_req(this);
  }

  /**
   * Evaluate whether the given `Version` satisfies the version requirement.
   */
  matches(version: Version): boolean {
    return matches_req(this, version);
  }
}

/**
 * A pair of comparison operator and partial version, such as `>=1.2`. Forms
 * one piece of a VersionReq.
 */
export class Comparator {
  public op: Op;
  public major: number;
  public minor: number | null;
  /**
   * Patch is only allowed if minor is Some.
   */
  public patch: number | null;
  /**
   * Non-empty pre-release is only allowed if patch is Some.
   */
  public pre: string;

  constructor(
    op: Op,
    major: number,
    minor: number | null = null,
    patch: number | null = null,
    pre = ''
  ) {
    this.op = op;
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.pre = pre;
  }

  static parse(text: string): Comparator {
    return parse_comparator(text);
  }

  toString(): string {
    return format_comparator(this);
  }

  matches(version: Version): boolean {
    return matches_comparator(this, version);
  }
}

/**
 * SemVer comparison operator: `=`, `>`, `>=`, `<`, `<=`, `~`, `^`, `*`.
 *
 * # Op::Exact
 * - &ensp;**`=I.J.K`**&emsp;&mdash;&emsp;exactly the version I.J.K
 * - &ensp;**`=I.J`**&emsp;&mdash;&emsp;equivalent to `>=I.J.0, <I.(J+1).0`
 * - &ensp;**`=I`**&emsp;&mdash;&emsp;equivalent to `>=I.0.0, <(I+1).0.0`
 *
 * # Op::Greater
 * - &ensp;**`>I.J.K`**
 * - &ensp;**`>I.J`**&emsp;&mdash;&emsp;equivalent to `>=I.(J+1).0`
 * - &ensp;**`>I`**&emsp;&mdash;&emsp;equivalent to `>=(I+1).0.0`
 *
 * # Op::GreaterEq
 * - &ensp;**`>=I.J.K`**
 * - &ensp;**`>=I.J`**&emsp;&mdash;&emsp;equivalent to `>=I.J.0`
 * - &ensp;**`>=I`**&emsp;&mdash;&emsp;equivalent to `>=I.0.0`
 *
 * # Op::Less
 * - &ensp;**`<I.J.K`**
 * - &ensp;**`<I.J`**&emsp;&mdash;&emsp;equivalent to `<I.J.0`
 * - &ensp;**`<I`**&emsp;&mdash;&emsp;equivalent to `<I.0.0`
 *
 * # Op::LessEq
 * - &ensp;**`<=I.J.K`**
 * - &ensp;**`<=I.J`**&emsp;&mdash;&emsp;equivalent to `<I.(J+1).0`
 * - &ensp;**`<=I`**&emsp;&mdash;&emsp;equivalent to `<(I+1).0.0`
 *
 * # Op::Tilde&emsp;("patch" updates)
 * *Tilde requirements allow the **patch** part of the semver version (the third number) to increase.*
 * - &ensp;**`~I.J.K`**&emsp;&mdash;&emsp;equivalent to `>=I.J.K, <I.(J+1).0`
 * - &ensp;**`~I.J`**&emsp;&mdash;&emsp;equivalent to `=I.J`
 * - &ensp;**`~I`**&emsp;&mdash;&emsp;equivalent to `=I`
 *
 * # Op::Caret&emsp;("compatible" updates)
 * *Caret requirements allow parts that are **right of the first nonzero** part of the semver version to increase.*
 * - &ensp;**`^I.J.K`**&ensp;(for I\>0)&emsp;&mdash;&emsp;equivalent to `>=I.J.K, <(I+1).0.0`
 * - &ensp;**`^0.J.K`**&ensp;(for J\>0)&emsp;&mdash;&emsp;equivalent to `>=0.J.K, <0.(J+1).0`
 * - &ensp;**`^0.0.K`**&emsp;&mdash;&emsp;equivalent to `=0.0.K`
 * - &ensp;**`^I.J`**&ensp;(for I\>0 or J\>0)&emsp;&mdash;&emsp;equivalent to `^I.J.0`
 * - &ensp;**`^0.0`**&emsp;&mdash;&emsp;equivalent to `=0.0`
 * - &ensp;**`^I`**&emsp;&mdash;&emsp;equivalent to `=I`
 *
 * # Op::Wildcard
 * - &ensp;**`I.J.*`**&emsp;&mdash;&emsp;equivalent to `=I.J`
 * - &ensp;**`I.*`**&ensp;or&ensp;**`I.*.*`**&emsp;&mdash;&emsp;equivalent to `=I`
 */
export type Op =
  | 'Exact'
  | 'Greater'
  | 'GreaterEq'
  | 'Less'
  | 'LessEq'
  | 'Tilde'
  | 'Caret'
  | 'Wildcard';
