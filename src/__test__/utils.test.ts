import * as Utils from '../utils';

describe('tests Utils.isValidSemver', () => {
  it('expects the following version codes to be valid', () => {
    expect(Utils.isValidSemver('1.2')).toBeTruthy();
    expect(Utils.isValidSemver('1.2.3')).toBeTruthy();
    expect(Utils.isValidSemver('1')).toBeTruthy();
    // @ts-expect-error
    expect(Utils.isValidSemver(1)).toBeTruthy();
  });

  it('expects the following version code inputs not to be valid', () => {
    expect(Utils.isValidSemver('')).toBeFalsy();
    // @ts-expect-error
    expect(Utils.isValidSemver(null)).toBeFalsy();
    expect(Utils.isValidSemver('whatever')).toBeFalsy();
  });
});

describe('tests Utils.sanitizeSemver', () => {
  it('expects the following version codes to be valid', () => {
    expect(Utils.sanitizeSemver('1.2')).toBe('1.2.0');
    expect(Utils.sanitizeSemver('1.2.3')).toBe('1.2.3');
    expect(Utils.sanitizeSemver('1')).toBe('1.0.0');
    // @ts-expect-error
    expect(Utils.sanitizeSemver(1)).toBe('1.0.0');
  });

  it('expects the following version code inputs not to be valid', () => {
    expect(Utils.sanitizeSemver('')).toBeFalsy();
    // @ts-expect-error
    expect(Utils.sanitizeSemver(null)).toBe(null);
    expect(Utils.sanitizeSemver('whatever')).toBe('whatever');
  });
});

describe('tests Utils.compareVersions', () => {
  it('expects the following comparisons to be correct', () => {
    expect(Utils.compareVersions('1.2', '1.5')).toBe(-1);
    expect(Utils.compareVersions('1', '1.5.0')).toBe(-1);
    expect(Utils.compareVersions('1.5.0', '1.0')).toBe(1);
    expect(Utils.compareVersions('1', '3')).toBe(-1);
    expect(Utils.compareVersions('3', '1')).toBe(1);
    // @ts-expect-error
    expect(Utils.compareVersions(3, '5')).toBe(-1);
    // @ts-expect-error
    expect(Utils.compareVersions(5, 3000)).toBe(-1);
    // @ts-expect-error
    expect(Utils.compareVersions(3000, 152442)).toBe(-1);
    // @ts-expect-error
    expect(Utils.compareVersions(999999, 152442)).toBe(1);
    // @ts-expect-error
    expect(Utils.compareVersions(undefined, 152442)).toBe(-1);
    // @ts-expect-error
    expect(Utils.compareVersions(152442, undefined)).toBe(1);
  });
});
