import { Version } from '../../src/lib';

export function version(text: string): Version {
  return Version.parse(text);
}

// export function req(text: string) -> VersionReq {
//     VersionReq::parse(text).unwrap()
// }
