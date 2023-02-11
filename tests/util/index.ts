import { Version, VersionReq } from '../../src/lib';

export function version(text: string): Version {
  return Version.parse(text);
}

export function req(text: string): VersionReq {
  return VersionReq.parse(text);
}
