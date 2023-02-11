import VersionReq, { Comparator } from './version_req';
import Version from './version';
import { comparePre } from './order';

export function matches_req(req: VersionReq, ver: Version): boolean {
  for (const cmp of req.comparators) {
    if (!matches_impl(cmp, ver)) {
      return false;
    }
  }

  if (!ver.pre) {
    return true;
  }

  // If a version has a prerelease tag (for example, 1.2.3-alpha.3) then it
  // will only be allowed to satisfy req if at least one comparator with the
  // same major.minor.patch also has a prerelease tag.
  for (const cmp of req.comparators) {
    if (pre_is_compatible(cmp, ver)) {
      return true;
    }
  }

  return false;
}

export function matches_comparator(cmp: Comparator, ver: Version): boolean {
  return (
    matches_impl(cmp, ver) && (ver.pre === '' || pre_is_compatible(cmp, ver))
  );
}

function matches_impl(cmp: Comparator, ver: Version): boolean {
  return cmp.op === 'Exact' || cmp.op === 'Wildcard'
    ? matches_exact(cmp, ver)
    : cmp.op === 'Greater'
    ? matches_greater(cmp, ver)
    : cmp.op === 'GreaterEq'
    ? matches_exact(cmp, ver) || matches_greater(cmp, ver)
    : cmp.op === 'Less'
    ? matches_less(cmp, ver)
    : cmp.op === 'LessEq'
    ? matches_exact(cmp, ver) || matches_less(cmp, ver)
    : cmp.op === 'Tilde'
    ? matches_tilde(cmp, ver)
    : cmp.op === 'Caret'
    ? matches_caret(cmp, ver)
    : false;
}

function matches_exact(cmp: Comparator, ver: Version): boolean {
  if (ver.major !== cmp.major) {
    return false;
  }

  if (cmp.minor !== null) {
    if (ver.minor !== cmp.minor) {
      return false;
    }
  }

  if (cmp.patch !== null) {
    if (ver.patch !== cmp.patch) {
      return false;
    }
  }

  return comparePre(ver.pre, cmp.pre) === 0;
}

function matches_greater(cmp: Comparator, ver: Version): boolean {
  if (ver.major !== cmp.major) {
    return ver.major > cmp.major;
  }

  if (cmp.minor === null) return false;
  if (ver.minor !== cmp.minor) {
    return ver.minor > cmp.minor;
  }

  if (cmp.patch === null) return false;
  if (ver.patch !== cmp.patch) {
    return ver.patch > cmp.patch;
  }

  return comparePre(ver.pre, cmp.pre) > 0;
}

function matches_less(cmp: Comparator, ver: Version): boolean {
  if (ver.major !== cmp.major) {
    return ver.major < cmp.major;
  }

  if (cmp.minor === null) return false;
  if (ver.minor !== cmp.minor) {
    return ver.minor < cmp.minor;
  }

  if (cmp.patch === null) return false;
  if (ver.patch !== cmp.patch) {
    return ver.patch < cmp.patch;
  }

  return comparePre(ver.pre, cmp.pre) < 0;
}

function matches_tilde(cmp: Comparator, ver: Version): boolean {
  if (ver.major !== cmp.major) {
    return false;
  }

  if (cmp.minor !== null && ver.minor !== cmp.minor) {
    return false;
  }
  if (cmp.patch !== null && ver.patch !== cmp.patch) {
    return ver.patch > cmp.patch;
  }

  return comparePre(ver.pre, cmp.pre) >= 0;
}

function matches_caret(cmp: Comparator, ver: Version): boolean {
  if (ver.major !== cmp.major) {
    return false;
  }

  if (cmp.minor === null) return true;

  if (cmp.patch === null) {
    if (cmp.major > 0) {
      return ver.minor >= cmp.minor;
    } else {
      return ver.minor === cmp.minor;
    }
  }

  if (cmp.major > 0) {
    if (ver.minor !== cmp.minor) {
      return ver.minor > cmp.minor;
    } else if (ver.patch !== cmp.patch) {
      return ver.patch > cmp.patch;
    }
  } else if (cmp.minor > 0) {
    if (ver.minor !== cmp.minor) {
      return false;
    } else if (ver.patch !== cmp.patch) {
      return ver.patch > cmp.patch;
    }
  } else if (ver.minor !== cmp.minor || ver.patch != cmp.patch) {
    return false;
  }

  return comparePre(ver.pre, cmp.pre) >= 0;
}

function pre_is_compatible(cmp: Comparator, ver: Version): boolean {
  return (
    cmp.major === ver.major &&
    cmp.minor === ver.minor &&
    cmp.patch === ver.patch &&
    cmp.pre !== ''
  );
}
