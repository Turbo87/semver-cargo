//! A parser and evaluator for Cargo's flavor of Semantic Versioning.
//!
//! Semantic Versioning (see <https://semver.org>) is a guideline for how
//! version numbers are assigned and incremented. It is widely followed within
//! the Cargo/crates.io ecosystem for Rust.
//!
//! <br>
//!
//! # Example
//!
//! ```
//! use semver::{BuildMetadata, Prerelease, Version, VersionReq};
//!
//! fn main() {
//!     let req = VersionReq::parse(">=1.2.3, <1.8.0").unwrap();
//!
//!     // Check whether this requirement matches version 1.2.3-alpha.1 (no)
//!     let version = Version {
//!         major: 1,
//!         minor: 2,
//!         patch: 3,
//!         pre: Prerelease::new("alpha.1").unwrap(),
//!         build: BuildMetadata::EMPTY,
//!     };
//!     assert!(!req.matches(&version));
//!
//!     // Check whether it matches 1.3.0 (yes it does)
//!     let version = Version::parse("1.3.0").unwrap();
//!     assert!(req.matches(&version));
//! }
//! ```
//!
//! <br><br>
//!
//! # Scope of this crate
//!
//! Besides Cargo, several other package ecosystems and package managers for
//! other languages also use SemVer:&ensp;RubyGems/Bundler for Ruby, npm for
//! JavaScript, Composer for PHP, CocoaPods for Objective-C...
//!
//! The `semver` crate is specifically intended to implement Cargo's
//! interpretation of Semantic Versioning.
//!
//! Where the various tools differ in their interpretation or implementation of
//! the spec, this crate follows the implementation choices made by Cargo. If
//! you are operating on version numbers from some other package ecosystem, you
//! will want to use a different semver library which is appropriate to that
//! ecosystem.
//!
//! The extent of Cargo's SemVer support is documented in the *[Specifying
//! Dependencies]* chapter of the Cargo reference.
//!
//! [Specifying Dependencies]: https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html

export { default as Version } from './version';
export { default as VersionReq, Comparator } from './version_req';
