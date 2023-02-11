import { req, version } from './util';
import { VersionReq } from '../src/lib';

function assert_match_all(req: VersionReq, versions: string[]) {
  for (const v of versions) {
    const parsed = version(v);
    expect(req.matches(parsed)).toBe(true);
  }
}

function assert_match_none(req: VersionReq, versions: string[]) {
  for (const v of versions) {
    const parsed = version(v);
    expect(req.matches(parsed)).toBe(false);
  }
}

test('basic', () => {
  const r = req('1.0.0');
  expect(r.toString()).toBe('^1.0.0');
  assert_match_all(r, ['1.0.0', '1.1.0', '1.0.1']);
  assert_match_none(r, ['0.9.9', '0.10.0', '0.1.0', '1.0.0-pre', '1.0.1-pre']);
});

test('exact', () => {
  let r = req('=1.0.0');
  expect(r.toString()).toBe('=1.0.0');
  assert_match_all(r, ['1.0.0']);
  assert_match_none(r, ['1.0.1', '0.9.9', '0.10.0', '0.1.0', '1.0.0-pre']);

  r = req('=0.9.0');
  expect(r.toString()).toBe('=0.9.0');
  assert_match_all(r, ['0.9.0']);
  assert_match_none(r, ['0.9.1', '1.9.0', '0.0.9', '0.9.0-pre']);

  r = req('=0.0.2');
  expect(r.toString()).toBe('=0.0.2');
  assert_match_all(r, ['0.0.2']);
  assert_match_none(r, ['0.0.1', '0.0.3', '0.0.2-pre']);

  r = req('=0.1.0-beta2.a');
  expect(r.toString()).toBe('=0.1.0-beta2.a');
  assert_match_all(r, ['0.1.0-beta2.a']);
  assert_match_none(r, ['0.9.1', '0.1.0', '0.1.1-beta2.a', '0.1.0-beta2']);

  r = req('=0.1.0+meta');
  expect(r.toString()).toBe('=0.1.0');
  assert_match_all(r, ['0.1.0', '0.1.0+meta', '0.1.0+any']);
});

test('greater_than', () => {
  let r = req('>= 1.0.0');
  expect(r.toString()).toBe('>=1.0.0');
  assert_match_all(r, ['1.0.0', '2.0.0']);
  assert_match_none(r, ['0.1.0', '0.0.1', '1.0.0-pre', '2.0.0-pre']);

  r = req('>= 2.1.0-alpha2');
  expect(r.toString()).toBe('>=2.1.0-alpha2');
  assert_match_all(r, ['2.1.0-alpha2', '2.1.0-alpha3', '2.1.0', '3.0.0']);
  assert_match_none(r, [
    '2.0.0',
    '2.1.0-alpha1',
    '2.0.0-alpha2',
    '3.0.0-alpha2',
  ]);
});

test('less_than', () => {
  let r = req('< 1.0.0');
  expect(r.toString()).toBe('<1.0.0');
  assert_match_all(r, ['0.1.0', '0.0.1']);
  assert_match_none(r, ['1.0.0', '1.0.0-beta', '1.0.1', '0.9.9-alpha']);

  r = req('<= 2.1.0-alpha2');
  assert_match_all(r, ['2.1.0-alpha2', '2.1.0-alpha1', '2.0.0', '1.0.0']);
  assert_match_none(r, [
    '2.1.0',
    '2.2.0-alpha1',
    '2.0.0-alpha2',
    '1.0.0-alpha2',
  ]);

  r = req('>1.0.0-alpha, <1.0.0');
  assert_match_all(r, ['1.0.0-beta']);

  r = req('>1.0.0-alpha, <1.0');
  assert_match_none(r, ['1.0.0-beta']);

  r = req('>1.0.0-alpha, <1');
  assert_match_none(r, ['1.0.0-beta']);
});

test('multiple', () => {
  let r = req('> 0.0.9, <= 2.5.3');
  expect(r.toString()).toBe('>0.0.9, <=2.5.3');
  assert_match_all(r, ['0.0.10', '1.0.0', '2.5.3']);
  assert_match_none(r, ['0.0.8', '2.5.4']);

  r = req('0.3.0, 0.4.0');
  expect(r.toString()).toBe('^0.3.0, ^0.4.0');
  assert_match_none(r, ['0.0.8', '0.3.0', '0.4.0']);

  r = req('<= 0.2.0, >= 0.5.0');
  expect(r.toString()).toBe('<=0.2.0, >=0.5.0');
  assert_match_none(r, ['0.0.8', '0.3.0', '0.5.1']);

  r = req('0.1.0, 0.1.4, 0.1.6');
  expect(r.toString()).toBe('^0.1.0, ^0.1.4, ^0.1.6');
  assert_match_all(r, ['0.1.6', '0.1.9']);
  assert_match_none(r, ['0.1.0', '0.1.4', '0.2.0']);

  expect(() => VersionReq.parse('> 0.1.0,')).toThrow(
    'unexpected end of input while parsing major version number'
  );

  expect(() => VersionReq.parse('> 0.3.0, ,')).toThrow(
    "unexpected character ',' while parsing major version number"
  );

  r = req('>=0.5.1-alpha3, <0.6');
  expect(r.toString()).toBe('>=0.5.1-alpha3, <0.6');
  assert_match_all(r, [
    '0.5.1-alpha3',
    '0.5.1-alpha4',
    '0.5.1-beta',
    '0.5.1',
    '0.5.5',
  ]);
  assert_match_none(r, [
    '0.5.1-alpha1',
    '0.5.2-alpha3',
    '0.5.5-pre',
    '0.5.0-pre',
  ]);
  assert_match_none(r, ['0.6.0', '0.6.0-pre']);

  // https://github.com/steveklabnik/semver/issues/56
  expect(() => VersionReq.parse('1.2.3 - 2.3.4')).toThrow(
    "expected comma after patch version number, found '-'"
  );
});

test('whitespace_delimited_comparator_sets', () => {
  // https://github.com/steveklabnik/semver/issues/55
  expect(() => VersionReq.parse('> 0.0.9 <= 2.5.3')).toThrow(
    "expected comma after patch version number, found '<'"
  );
});

test('tilde', () => {
  let r = req('~1');
  assert_match_all(r, ['1.0.0', '1.0.1', '1.1.1']);
  assert_match_none(r, ['0.9.1', '2.9.0', '0.0.9']);

  r = req('~1.2');
  assert_match_all(r, ['1.2.0', '1.2.1']);
  assert_match_none(r, ['1.1.1', '1.3.0', '0.0.9']);

  r = req('~1.2.2');
  assert_match_all(r, ['1.2.2', '1.2.4']);
  assert_match_none(r, ['1.2.1', '1.9.0', '1.0.9', '2.0.1', '0.1.3']);

  r = req('~1.2.3-beta.2');
  assert_match_all(r, ['1.2.3', '1.2.4', '1.2.3-beta.2', '1.2.3-beta.4']);
  assert_match_none(r, ['1.3.3', '1.1.4', '1.2.3-beta.1', '1.2.4-beta.2']);
});

test('caret', () => {
  let r = req('^1');
  assert_match_all(r, ['1.1.2', '1.1.0', '1.2.1', '1.0.1']);
  assert_match_none(r, ['0.9.1', '2.9.0', '0.1.4']);
  assert_match_none(r, ['1.0.0-beta1', '0.1.0-alpha', '1.0.1-pre']);

  r = req('^1.1');
  assert_match_all(r, ['1.1.2', '1.1.0', '1.2.1']);
  assert_match_none(r, ['0.9.1', '2.9.0', '1.0.1', '0.1.4']);

  r = req('^1.1.2');
  assert_match_all(r, ['1.1.2', '1.1.4', '1.2.1']);
  assert_match_none(r, ['0.9.1', '2.9.0', '1.1.1', '0.0.1']);
  assert_match_none(r, ['1.1.2-alpha1', '1.1.3-alpha1', '2.9.0-alpha1']);

  r = req('^0.1.2');
  assert_match_all(r, ['0.1.2', '0.1.4']);
  assert_match_none(r, ['0.9.1', '2.9.0', '1.1.1', '0.0.1']);
  assert_match_none(r, ['0.1.2-beta', '0.1.3-alpha', '0.2.0-pre']);

  r = req('^0.5.1-alpha3');
  assert_match_all(r, [
    '0.5.1-alpha3',
    '0.5.1-alpha4',
    '0.5.1-beta',
    '0.5.1',
    '0.5.5',
  ]);
  assert_match_none(r, [
    '0.5.1-alpha1',
    '0.5.2-alpha3',
    '0.5.5-pre',
    '0.5.0-pre',
    '0.6.0',
  ]);

  r = req('^0.0.2');
  assert_match_all(r, ['0.0.2']);
  assert_match_none(r, ['0.9.1', '2.9.0', '1.1.1', '0.0.1', '0.1.4']);

  r = req('^0.0');
  assert_match_all(r, ['0.0.2', '0.0.0']);
  assert_match_none(r, ['0.9.1', '2.9.0', '1.1.1', '0.1.4']);

  r = req('^0');
  assert_match_all(r, ['0.9.1', '0.0.2', '0.0.0']);
  assert_match_none(r, ['2.9.0', '1.1.1']);

  r = req('^1.4.2-beta.5');
  assert_match_all(r, [
    '1.4.2',
    '1.4.3',
    '1.4.2-beta.5',
    '1.4.2-beta.6',
    '1.4.2-c',
  ]);
  assert_match_none(r, [
    '0.9.9',
    '2.0.0',
    '1.4.2-alpha',
    '1.4.2-beta.4',
    '1.4.3-beta.5',
  ]);
});

test('wildcard', () => {
  expect(() => VersionReq.parse('')).toThrow(
    'unexpected end of input while parsing major version number'
  );

  let r = req('*');
  assert_match_all(r, ['0.9.1', '2.9.0', '0.0.9', '1.0.1', '1.1.1']);
  assert_match_none(r, ['1.0.0-pre']);

  for (const s of ['x', 'X']) {
    expect(r).toEqual(req(s));
  }

  r = req('1.*');
  assert_match_all(r, ['1.2.0', '1.2.1', '1.1.1', '1.3.0']);
  assert_match_none(r, ['0.0.9', '1.2.0-pre']);

  for (const s of ['1.x', '1.X', '1.*.*']) {
    expect(r).toEqual(req(s));
  }

  r = req('1.2.*');
  assert_match_all(r, ['1.2.0', '1.2.2', '1.2.4']);
  assert_match_none(r, ['1.9.0', '1.0.9', '2.0.1', '0.1.3', '1.2.2-pre']);

  for (const s of ['1.2.x', '1.2.X']) {
    expect(r).toEqual(req(s));
  }
});

test('logical_or', () => {
  // https://github.com/steveklabnik/semver/issues/57
  expect(() => VersionReq.parse('=1.2.3 || =2.3.4')).toThrow(
    "expected comma after patch version number, found '|'"
  );

  expect(() => VersionReq.parse('1.1 || =1.2.3')).toThrow(
    "expected comma after minor version number, found '|'"
  );

  expect(() => VersionReq.parse('6.* || 8.* || >= 10.*')).toThrow(
    "expected comma after minor version number, found '|'"
  );
});

test('any', () => {
  const r = VersionReq.STAR;
  assert_match_all(r, ['0.0.1', '0.1.0', '1.0.0']);
});

test('pre', () => {
  const r = req('=2.1.1-really.0');
  assert_match_all(r, ['2.1.1-really.0']);
});

test('parse_errors', () => {
  expect(() => VersionReq.parse('\0')).toThrow(
    "unexpected character '\\0' while parsing major version number"
  );

  expect(() => VersionReq.parse('>= >= 0.0.2')).toThrow(
    "unexpected character '>' while parsing major version number"
  );

  expect(() => VersionReq.parse('>== 0.0.2')).toThrow(
    "unexpected character '=' while parsing major version number"
  );

  expect(() => VersionReq.parse('a.0.0')).toThrow(
    "unexpected character 'a' while parsing major version number"
  );

  expect(() => VersionReq.parse('1.0.0-')).toThrow(
    'empty identifier segment in pre-release identifier'
  );

  expect(() => VersionReq.parse('>=')).toThrow(
    'unexpected end of input while parsing major version number'
  );
});

test('cargo3202', () => {
  let r = req('0.*.*');
  expect(r.toString()).toBe('0.*');
  assert_match_all(r, ['0.5.0']);

  r = req('0.0.*');
  expect(r.toString()).toBe('0.0.*');
});

test('digit_after_wildcard', () => {
  expect(() => VersionReq.parse('*.1')).toThrow(
    'unexpected character after wildcard in version req'
  );

  expect(() => VersionReq.parse('1.*.1')).toThrow(
    'unexpected character after wildcard in version req'
  );

  expect(() => VersionReq.parse('>=1.*.1')).toThrow(
    'unexpected character after wildcard in version req'
  );
});

test('leading_digit_in_pre_and_build', () => {
  for (const op of ['=', '>', '>=', '<', '<=', '~', '^']) {
    // digit then alpha
    req(`${op} 1.2.3-1a`);
    req(`${op} 1.2.3+1a`);

    // digit then alpha (leading zero)
    req(`${op} 1.2.3-01a`);
    req(`${op} 1.2.3+01`);

    // multiple
    req(`${op} 1.2.3-1+1`);
    req(`${op} 1.2.3-1-1+1-1-1`);
    req(`${op} 1.2.3-1a+1a`);
    req(`${op} 1.2.3-1a-1a+1a-1a-1a`);
  }
});

test('wildcard_and_another', () => {
  expect(() => VersionReq.parse('*, 0.20.0-any')).toThrow(
    'wildcard req (*) must be the only comparator in the version req'
  );

  expect(() => VersionReq.parse('0.20.0-any, *')).toThrow(
    'wildcard req (*) must be the only comparator in the version req'
  );

  expect(() => VersionReq.parse('0.20.0-any, *, 1.0')).toThrow(
    'wildcard req (*) must be the only comparator in the version req'
  );
});
