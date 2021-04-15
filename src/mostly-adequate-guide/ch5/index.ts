import { flow } from "fp-ts/lib/function";
import R, {
  compose as rCompose,
  curry as rCurry,
  join,
  map,
  split,
  tap,
  replace,
} from "ramda";
import { F } from "ts-toolbelt";

export const compose: F.Compose = rCompose;

export function curry<Fn extends F.Function>(fn: Fn): F.Curry<Fn> {
  return rCurry(fn);
}

export const compose2 = <A, B, C>(f: (a: B) => C, g: (a: A) => B) => (x: A) =>
  f(g(x));

export const toUpperCase = (x: string) => x.toUpperCase();
export const exclaim = (x: string) => `${x}!`;
export const shout = compose2(exclaim, toUpperCase);

function head<T>(as: T[]): T {
  return as[0];
}

function first(s: string): string {
  return s[0];
}

export function reduce<A, B>(combinator: (b: B, a: A) => B) {
  return function (initialValue: B) {
    return function (as: A[]) {
      return as.reduce(combinator, initialValue);
    };
  };
}

export const prepend = <A>(as: A[], a: A) => [a, ...as];
export const append = <A>(as: A[], a: A) => [...as, a];
export const reverse: <A>(as: A[]) => A[] = (as) =>
  reduce(prepend)(new Array())(as);
export const last: <A>(as: A[]) => A = flow(reverse, head);
export const lastUpper: (as: string[]) => string = compose(
  toUpperCase,
  last,
);
export const loudLastUpper: (as: string[]) => string = compose(
  exclaim,
  toUpperCase,
  last
);
export const firstUpper: (s: string[]) => string = compose(toUpperCase, head);
export const firstLetterUppercase = compose(toUpperCase, first);

/** Not pointfree */
export function initials(name: string) {
  return name
    .split(" ")
    .map(firstLetterUppercase)
    .map(R.concat(R.__, "."))
    .join(" ");
}

/** Pointfree version */
export const initials2 = compose(
  join(" "),
  map(R.concat(R.__, ".")),
  map(firstLetterUppercase),
  split(" ")
);

export const dasherize = compose(
  join("-"),
  map(R.toLower),
  split(" "),
  replace(/\s{2,}/gi, " ")
);
