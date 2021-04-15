import { curry, map } from "ramda";

export function match(what: RegExp, str: string) {
  return str.match(what);
}

export function replace(what: RegExp, replacement: string, str: string) {
  return str.replace(what, replacement);
}

export function filter<T>(predicate: Predicate<T>, as: Array<T>) {
  return as.filter(predicate);
}

interface Predicate<T = never> {
  (value: T): unknown;
}

export const matchC = curry(match);
export const replaceC = curry(replace);
export const filterC = curry(filter);

/**
 * Element -> NodeListOf<ChildNode>
 * @param x
 */
function getChildren(x: Element) {
  return x.childNodes;
}

/**
 * Element[] -> NodeListOf<ChildNode>[]
 */
const allTheChildren = map(getChildren);
