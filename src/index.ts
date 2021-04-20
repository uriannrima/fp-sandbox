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
  fastestCar4,
} from "./mostly-adequate-guide/ch5/exercises";
import {
  Container,
  Either,
  getAge,
  getTwenty,
  getTwenty2,
  Maybe,
  streetName,
  zoltar,
  zoltar2,
} from "./mostly-adequate-guide/ch8";
import { add, prop } from "ramda";
import dayjs from "dayjs";

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
deepStrictEqual(fastestCar(CARS), fastestCar4(CARS));

deepStrictEqual(
  Container.of(2).map((two) => two + 2),
  Container.of(4)
);

deepStrictEqual(
  Container.of("flamethrowers").map((s) => s.toUpperCase()),
  Container.of("FLAMETHROWERS")
);

deepStrictEqual(
  Container.of("bombs")
    .map((s) => `${s} away`)
    .map((s) => s.length),
  Container.of(10)
);

deepStrictEqual(
  Maybe.of("Malkovich Malkovich").map(matchC(/a/gi)),
  Maybe.of(["a", "a"])
);

deepStrictEqual(
  Maybe.of<string | null>(null).map(matchC(/a/gi)),
  Maybe.Nothing
);

deepStrictEqual(
  Maybe.of<{ name: string; age: number }>({
    name: "Boris",
    age: NaN,
  })
    .map((a) => a.age)
    .map((age) => age + 10),
  Maybe.Nothing
);

deepStrictEqual(
  Maybe.of<{ name: string; age: number }>({ name: "Dinah", age: 14 })
    .map((a) => a.age)
    .map((age) => age + 10),
  Maybe.of(24)
);

deepStrictEqual(streetName({ addresses: [] }), Maybe.Nothing);
deepStrictEqual(
  streetName({ addresses: [{ street: "Shady Ln.", number: 4201 }] }),
  Maybe.of("Shady Ln.")
);

deepStrictEqual(
  getTwenty({
    balance: 10,
  }),
  Maybe.Nothing
);
deepStrictEqual(
  getTwenty({
    balance: 200,
  }),
  Maybe.of("Your balance is $180")
);
deepStrictEqual(
  getTwenty2({
    balance: 200,
  }),
  "Your balance is $180"
);
deepStrictEqual(
  getTwenty2({
    balance: 10,
  }),
  "You're broke."
);

deepStrictEqual(
  Either.of("rain").map((str) => `b${str}`),
  Either.of("brain")
);

deepStrictEqual(
  Either.left("rain").map(
    (str) => `It's gonna ${str}, better bring your umbrella!`
  ),
  Either.left("rain")
);

deepStrictEqual(
  Either.of({ host: "localhost", port: 80 }).map((a) => a.host),
  Either.of("localhost")
);

deepStrictEqual(
  Either.left("rolleyes").map((a: any) => a.host),
  Either.left("rolleyes")
);

deepStrictEqual(getAge(dayjs(), { birthDate: "2005-12-12" }), Either.of(15));
deepStrictEqual(
  getAge(dayjs(), { birthDate: "July 32, 2001" }),
  Either.left("Birth date could not be parsed")
);

deepStrictEqual(zoltar({ birthDate: "2005-12-12" }), Either.of(undefined));
deepStrictEqual(
  zoltar({ birthDate: "balloons" }),
  Either.left("Birth date could not be parsed")
);

deepStrictEqual(zoltar2({ birthDate: "2005-12-12" }), undefined);
deepStrictEqual(zoltar2({ birthDate: "balloons" }), undefined);
