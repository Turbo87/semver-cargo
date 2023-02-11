semver-cargo
===============================================================================

A parser and evaluator for [Cargo]'s flavor of Semantic Versioning.

Semantic Versioning (see <https://semver.org>) is a guideline for how version
numbers are assigned and incremented. It is widely followed within the
[Cargo]/[crates.io] ecosystem for [Rust].

This project is a JavaScript port of the original Rust project at
<https://github.com/dtolnay/semver>.


Example
-------------------------------------------------------------------------------

```ts
import { Version, VersionReq } from 'semver-cargo';

let req = VersionReq.parse(">=1.2.3, <1.8.0");

// Check whether this requirement matches version 1.2.3-alpha.1 (no)
let version1 = new Version(1, 2, 3, 'alpha.1');
assert(!req.matches(version1));

// Check whether it matches 1.3.0 (yes it does)
let version2 = Version.parse("1.3.0");
assert(req.matches(version2));
```


Scope of this crate
-------------------------------------------------------------------------------

Besides Cargo, several other package ecosystems and package managers for other
languages also use SemVer:&ensp;RubyGems/Bundler for Ruby, npm for JavaScript,
Composer for PHP, CocoaPods for Objective-C...

The `semver-cargo` package is specifically intended to implement Cargo's
interpretation of Semantic Versioning.

Where the various tools differ in their interpretation or implementation of the
spec, this crate follows the implementation choices made by Cargo. If you are
operating on version numbers from some other package ecosystem, you will want to
use a different semver library which is appropriate to that ecosystem.

The extent of Cargo's SemVer support is documented in the *[Specifying
Dependencies]* chapter of the Cargo reference.

License
-------------------------------------------------------------------------------

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT) at your option.

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this crate by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.

[Cargo]: https://doc.rust-lang.org/cargo/
[crates.io]: https://crates.io/
[Rust]: https://www.rust-lang.org/
[Specifying Dependencies]: https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html
