import { deepStrictEqual } from "assert";
import {
  match,
  matchC,
  filterC,
  replaceC,
} from "./mostly-adequate-guide/ch4/index";
import {
  filterQs,
  filterQs2,
  max,
  max2,
  sentences,
  sliceC,
  take,
  words,
  words2,
} from "./mostly-adequate-guide/ch4/exercises";
import {
  shout,
  last,
  lastUpper,
  loudLastUpper,
  reverse,
  initials,
  initials2,
  dasherize,
} from "./mostly-adequate-guide/ch5";
import {
  isLastInStock,
  isLastInStock2,
  isLastInStock3,
  CARS,
  nameOfFirstCar,
  nameOfFirstCar2,
  averageDollarValue,
  averageDollarValue2,
  sanitizeNames,
  availablePrices,
  availablePrices2,
  fastestCar,
  fastestCar2,
  fastestCar3,
} from "./mostly-adequate-guide/ch5/exercises";

deepStrictEqual(match(/\s+/g, "hello world"), matchC(/\s+/g)("hello world"));

const hasSpaces = matchC(/\s+/g);
const findSpaces = filterC(hasSpaces);
deepStrictEqual(findSpaces(["tori_spelling", "tori amos"]), ["tori amos"]);

const noVowels = replaceC(/[aeiouy]/gi);
const censored = noVowels("*");
deepStrictEqual(censored("Chocolate Rain"), "Ch*c*l*t* R**n");

deepStrictEqual(words("Hello World"), words2("Hello World"));

deepStrictEqual(sentences(["Hello", "World"]), "Hello World");

deepStrictEqual(filterQs(["Queue", "True"]), filterQs2(["Queue", "True"]));

deepStrictEqual(max([1, 2, 3]), max2([1, 2, 3]));

deepStrictEqual([1, 2, 3].slice(1, 2), sliceC(1)(2)([1, 2, 3]));
deepStrictEqual(["a", "b"], take(2)(["a", "b", "c"]));

deepStrictEqual(shout("send in the clowns"), "SEND IN THE CLOWNS!");

const args = ["jumpkick", "roundhouse", "uppercut"];

deepStrictEqual(last(args), "uppercut");

deepStrictEqual(lastUpper(args), "UPPERCUT");
deepStrictEqual(loudLastUpper(args), "UPPERCUT!");
deepStrictEqual(reverse(["a", "b", "c"]), ["c", "b", "a"]);
deepStrictEqual(initials("hunter stockton thompson"), "H. S. T.");
deepStrictEqual(
  initials("hunter stockton thompson"),
  initials2("hunter stockton thompson")
);
deepStrictEqual(dasherize("The world is a vampire"), "the-world-is-a-vampire");

deepStrictEqual(isLastInStock(CARS), false);
deepStrictEqual(isLastInStock(CARS), isLastInStock2(CARS));
deepStrictEqual(isLastInStock(CARS), isLastInStock3(CARS));

deepStrictEqual(nameOfFirstCar(CARS), "Ferrari FF");
deepStrictEqual(nameOfFirstCar(CARS), nameOfFirstCar2(CARS));

deepStrictEqual(averageDollarValue(CARS), 790700);
deepStrictEqual(averageDollarValue(CARS), averageDollarValue2(CARS));

deepStrictEqual(sanitizeNames(CARS), [
  "ferrari_ff",
  "spyker_c12_zagato",
  "jaguar_xkr_s",
  "audi_r8",
  "aston_martin_one_77",
  "pagani_huayra",
]);

deepStrictEqual(availablePrices(CARS), "€700,000.00, €1,850,000.00");
deepStrictEqual(availablePrices(CARS), availablePrices2(CARS));

deepStrictEqual(fastestCar(CARS), "Aston Martin One-77 is the fastest");
deepStrictEqual(fastestCar(CARS), fastestCar2(CARS));
deepStrictEqual(fastestCar(CARS), fastestCar3(CARS));
