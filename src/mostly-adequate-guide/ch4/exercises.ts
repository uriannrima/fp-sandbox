import { join, reduce, split } from "ramda";
import { filter, filterC, match, matchC } from ".";

export const words = function (str: string) {
  return split(" ", str);
};

export const words2 = split(" ");

export const sentences = join(" ");

export const filterQs = (xs: string[]) =>
  filter((x: string) => match(/q/i, x), xs);

export const filterQs2 = filterC(matchC(/q/i));

const _keepHighest = function (x: number, y: number) {
  return x >= y ? x : y;
};

export const max = function (xs: number[]) {
  return reduce(
    function (acc, x) {
      return _keepHighest(acc, x);
    },
    -Infinity,
    xs
  );
};

export const max2 = reduce(_keepHighest, -Infinity);

export function slice<A>(start: number, end: number, as: A[]) {
  return as.slice(start, end);
}

export function sliceC(start?: number) {
  return function (end?: number) {
    return function <A>(as: A[]) {
      return as.slice(start, end);
    };
  };
}

export const take = sliceC(0);

/**
 * Remember, start with a variable first, makes it easier to create curried versions.
 * Since N is simple passed to sliceC(0), take can just be a instance of sliceC(0) like above.
 *
 * So this, is unnecessary:
 * export function take(n: number) {
 *    return sliceC(0)(n);
 * }
 */
