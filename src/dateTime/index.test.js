// @flow

import GraphQLDateTime from './';
import * as Kind from 'graphql/language/kinds';

const {stringify} = require('jest-matcher-utils');

const invalidDates = [
  // General
  'Invalid date',
  // Dateimte with hours
  '2016-02-01T',
  '2016-02-01T25Z',
  '2016-02-01T2Z',
  '2016-02-01T24',
  // Datetime with hours and minutes
  '2016-02-01T24:01Z',
  '2016-02-01T00:60Z',
  '2016-02-01T0:60Z',
  '2016-02-01T00:0Z',
  '2015-02-29T00:00Z',
  '2016-02-01T0000',
  // Datetime with hours, minutes and seconds
  '2016-02-01T000059Z',
  '2016-02-01T00:00:60Z',
  '2016-02-01T00:00:0Z',
  '2015-02-29T00:00:00Z',
  '2016-02-01T00:00:00',
  // Datetime with hours, minutes, seconds and milliseconds
  '2016-02-01T00:00:00.1Z',
  '2016-02-01T00:00:00.22Z',
  '2015-02-29T00:00:00.000Z',
  '2016-02-01T00:00:00.223',
]

const validDates = [
  // Datetime with hours
  [ '2016-02-01T00Z', new Date(Date.UTC(2016, 1, 1, 0)) ],
  [ '2016-02-01T13Z', new Date(Date.UTC(2016, 1, 1, 13)) ],
  [ '2016-02-01T24Z', new Date(Date.UTC(2016, 1, 2, 0)) ],
  // Datetime with hours and minutes
  [ '2016-02-01T00:00Z', new Date(Date.UTC(2016, 1, 1, 0, 0)) ],
  [ '2016-02-01T23:00Z', new Date(Date.UTC(2016, 1, 1, 23, 0)) ],
  [ '2016-02-01T23:59Z', new Date(Date.UTC(2016, 1, 1, 23, 59)) ],
  [ '2016-02-01T15:32Z', new Date(Date.UTC(2016, 1, 1, 15, 32)) ],
  // Datetime with hours, minutes and seconds
  [ '2016-02-01T00:00:00Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0)) ],
  [ '2016-02-01T00:00:15Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 15)) ],
  [ '2016-02-01T00:00:59Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 59)) ],
  // Datetime with hours, minutes, seconds and milliseconds
  [ '2016-02-01T00:00:00.000Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0)) ],
  [ '2016-02-01T00:00:00.999Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 999)) ],
  [ '2016-02-01T00:00:00.456Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 456)) ],
]

describe('GraphQLDateTime', () => {

  describe('serialization', () => {
    [
      {},
      [],
      null,
      undefined,
      true,
    ].forEach(invalidInput => {
      it(`throws error when serializing ${stringify(invalidInput)}`, () => {
        expect(() =>
          GraphQLDateTime.serialize(invalidInput)
        ).toThrowErrorMatchingSnapshot()
      })
    });

    // Serialize from Date
    [
      [ new Date(Date.UTC(2016, 0, 1)), '2016-01-01T00:00:00.000Z' ],
      [ new Date(Date.UTC(2016, 0, 1, 14, 48, 10, 3)), '2016-01-01T14:48:10.003Z' ],
    ].forEach(([ value, expected ]) => {
      it(`serializes javascript Date ${stringify(value)} into ${stringify(expected)}`, () => {
        expect(
          GraphQLDateTime.serialize(value)
        ).toEqual(expected);
      })
    });

    it(`throws error when serializing invalid date`, () => {
      expect(() =>
        GraphQLDateTime.serialize(new Date('invalid date'))
      ).toThrowErrorMatchingSnapshot();
    });

    validDates.forEach(([value]) => {
      it(`serializes date-string ${value}`, () => {
        expect(
          GraphQLDateTime.serialize(value)
        ).toEqual(value);
      });
    });

    invalidDates.forEach(dateString => {
      it(`throws an error when serializing an invalid date-string ${stringify(dateString)}`, () => {
        expect(() =>
          GraphQLDateTime.serialize(dateString)
        ).toThrowErrorMatchingSnapshot();
      });
    });

    // Serializes Unix timestamp
    [
      [ 854325678, '1997-01-27T00:41:18.000Z' ],
      [ 876535, '1970-01-11T03:28:55.000Z' ],
      [ 876535.8, '1970-01-11T03:28:55.800Z' ],
      [ 876535.8321, '1970-01-11T03:28:55.832Z' ],
      [ -876535.8, '1969-12-21T20:31:04.200Z' ],
      // The maximum representable unix timestamp
      [ 2147483647, '2038-01-19T03:14:07.000Z' ],
      // The minimum representable unit timestamp
      [ -2147483648, '1901-12-13T20:45:52.000Z' ],
    ].forEach(([ value, expected ]) => {
      it(`serializes unix timestamp ${stringify(value)} into date-string ${expected}`, ()=> {
        expect(
          GraphQLDateTime.serialize(value)
        ).toEqual(expected);
      })
    });

    [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      // assume Unix timestamp are 32-bit
      2147483648,
      -2147483649
    ].forEach(value => {
      it(`throws an error serializing the invalid unix timestamp ${stringify(value)}`, () => {
        expect(() =>
          GraphQLDateTime.serialize(value)
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('value parsing', () => {

    validDates.forEach(([ value, expected ]) => {
      it(`parses date-string ${stringify(value)} into javascript Date ${stringify(expected)}`, () => {
        expect(
          GraphQLDateTime.parseValue(value)
        ).toEqual(expected);
      })
    });

    [
      null,
      undefined,
      4566,
      {},
      [],
      true,
    ].forEach(invalidInput => {
      it(`throws an error when parsing ${stringify(invalidInput)}`, () => {
        expect(() =>
          GraphQLDateTime.parseValue(invalidInput)
        ).toThrowErrorMatchingSnapshot();
      });
    });

    invalidDates.forEach(dateString => {
      it(`throws an error parsing an invalid date-string ${stringify(dateString)}`, () => {
        expect(() =>
          GraphQLDateTime.parseValue(dateString)
        ).toThrowErrorMatchingSnapshot();
      })
    });
  });

  describe('literial parsing', () => {

    it('parses literal DateTime', () => {

      validDates.forEach(([ value, expected ]) => {
        const literal = {
          kind: Kind.STRING, value
        };

        it(`parses literal ${stringify(literal)} into javascript Date ${stringify(expected)}`, () => {
          expect(
            GraphQLDateTime.parseLiteral(literal).toISOString()
          ).toEqual(expected.toISOString());
        });
      });

      invalidDates.forEach(value => {
        const invalidLiteral = {
          kind: Kind.STRING, value
        };
        it(`returns null when parsing invalid literal ${stringify(invalidLiteral)}`, () => {
          expect(
            GraphQLDateTime.parseLiteral(invalidLiteral)
          ).toEqual(null);
        });
      });

      const invalidLiteralFloat = {
        kind: Kind.FLOAT, value: 5
      };
      it(`returns null when parsing invalid literal ${stringify(invalidLiteralFloat)}`, () => {
        expect(
          GraphQLDateTime.parseLiteral(invalidLiteralFloat)
        ).toEqual(null);
      });
    });
  });

});
