import { version } from './util';
import { Version } from '../src/lib';

test('parse', () => {
  expect(() => version('')).toThrow(
    'unexpected end of input while parsing major version number'
  );

  expect(() => version('  ')).toThrow(
    "unexpected character ' ' while parsing major version number"
  );

  expect(() => version('1')).toThrow(
    'unexpected end of input while parsing major version number'
  );

  expect(() => version('1.2')).toThrow(
    'unexpected end of input while parsing minor version number'
  );

  expect(() => version('1.2.3-')).toThrow(
    'empty identifier segment in pre-release identifier'
  );

  expect(() => version('a.b.c')).toThrow(
    "unexpected character 'a' while parsing major version number"
  );

  expect(() => version('1.2.3 abc')).toThrow(
    "unexpected character ' ' after patch version number"
  );

  expect(() => version('1.2.3-01')).toThrow(
    'invalid leading zero in pre-release identifier'
  );

  let parsed = version('1.2.3');
  let expected = new Version(1, 2, 3);
  expect(parsed).toEqual(expected);
  expected = new Version(1, 2, 3);
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3-alpha1');
  expected = new Version(1, 2, 3, 'alpha1');
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3+build5');
  expected = new Version(1, 2, 3, '', 'build5');
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3+5build');
  expected = new Version(1, 2, 3, '', '5build');
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3-alpha1+build5');
  expected = new Version(1, 2, 3, 'alpha1', 'build5');
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3-1.alpha1.9+build5.7.3aedf');
  expected = new Version(1, 2, 3, '1.alpha1.9', 'build5.7.3aedf');
  expect(parsed).toEqual(expected);

  parsed = version('1.2.3-0a.alpha1.9+05build.7.3aedf');
  expected = new Version(1, 2, 3, '0a.alpha1.9', '05build.7.3aedf');
  expect(parsed).toEqual(expected);

  parsed = version('0.4.0-beta.1+0851523');
  expected = new Version(0, 4, 0, 'beta.1', '0851523');
  expect(parsed).toEqual(expected);

  // for https://nodejs.org/dist/index.json, where some older npm versions are "1.1.0-beta-10"
  parsed = version('1.1.0-beta-10');
  expected = new Version(1, 1, 0, 'beta-10');
  expect(parsed).toEqual(expected);
});

test('eq', () => {
  expect(version('1.2.3')).toEqual(version('1.2.3'));
  expect(version('1.2.3-alpha1')).toEqual(version('1.2.3-alpha1'));
  expect(version('1.2.3+build.42')).toEqual(version('1.2.3+build.42'));
  expect(version('1.2.3-alpha1+42')).toEqual(version('1.2.3-alpha1+42'));
});

test('ne', () => {
  expect(version('0.0.0')).not.toEqual(version('0.0.1'));
  expect(version('0.0.0')).not.toEqual(version('0.1.0'));
  expect(version('0.0.0')).not.toEqual(version('1.0.0'));
  expect(version('1.2.3-alpha')).not.toEqual(version('1.2.3-beta'));
  expect(version('1.2.3+23')).not.toEqual(version('1.2.3+42'));
});

test('display', () => {
  expect(version('1.2.3').toString()).toBe('1.2.3');
  expect(version('1.2.3-alpha1').toString()).toBe('1.2.3-alpha1');
  expect(version('1.2.3+build.42').toString()).toBe('1.2.3+build.42');
  expect(version('1.2.3-alpha1+42').toString()).toBe('1.2.3-alpha1+42');
});

test('lt', () => {
  expect(version('0.0.0').lt(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.0.0').lt(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.0').lt(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3-alpha1').lt(version('1.2.3'))).toBe(true);
  expect(version('1.2.3-alpha1').lt(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3-alpha2').lt(version('1.2.3-alpha2'))).toBe(false);
  expect(version('1.2.3+23').lt(version('1.2.3+42'))).toBe(true);
});

test('lte', () => {
  expect(version('0.0.0').lte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.0.0').lte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.0').lte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3-alpha1').lte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3-alpha2').lte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3+23').lte(version('1.2.3+42'))).toBe(true);
});

test('gt', () => {
  expect(version('1.2.3-alpha2').gt(version('0.0.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gt(version('1.0.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gt(version('1.2.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gt(version('1.2.3-alpha1'))).toBe(true);
  expect(version('1.2.3').gt(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3-alpha2').gt(version('1.2.3-alpha2'))).toBe(false);
  expect(version('1.2.3+23').gt(version('1.2.3+42'))).toBe(false);
});

test('gte', () => {
  expect(version('1.2.3-alpha2').gte(version('0.0.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gte(version('1.0.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gte(version('1.2.0'))).toBe(true);
  expect(version('1.2.3-alpha2').gte(version('1.2.3-alpha1'))).toBe(true);
  expect(version('1.2.3-alpha2').gte(version('1.2.3-alpha2'))).toBe(true);
  expect(version('1.2.3+23').gte(version('1.2.3+42'))).toBe(false);
});

test('spec_order', () => {
  const vs = [
    '1.0.0-alpha',
    '1.0.0-alpha.1',
    '1.0.0-alpha.beta',
    '1.0.0-beta',
    '1.0.0-beta.2',
    '1.0.0-beta.11',
    '1.0.0-rc.1',
    '1.0.0',
  ];
  for (let i = 1; i < vs.length; i++) {
    const a = version(vs[i - 1]);
    const b = version(vs[i]);
    expect(a.lt(b)).toBe(true);
  }
});
