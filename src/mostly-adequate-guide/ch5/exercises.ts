import { flow } from "fp-ts/lib/function";
import {
  prop,
  defaultTo,
  add,
  reduce,
  map,
  replace,
  toLower,
  filter,
  join,
  sortBy,
  concat,
  flip,
} from "ramda";
import { compose } from ".";

export const CARS = [
  {
    name: "Ferrari FF",
    horsepower: 660,
    dollar_value: 700000,
    in_stock: true,
  },
  {
    name: "Spyker C12 Zagato",
    horsepower: 650,
    dollar_value: 648000,
    in_stock: false,
  },
  {
    name: "Jaguar XKR-S",
    horsepower: 550,
    dollar_value: 132000,
    in_stock: false,
  },
  {
    name: "Audi R8",
    horsepower: 525,
    dollar_value: 114200,
    in_stock: false,
  },
  {
    name: "Aston Martin One-77",
    horsepower: 750,
    dollar_value: 1850000,
    in_stock: true,
  },
  {
    name: "Pagani Huayra",
    horsepower: 700,
    dollar_value: 1300000,
    in_stock: false,
  },
];

type Cars = typeof CARS;
type Car = typeof CARS[0];

export const isLastInStock = function (cars: Cars) {
  var last_car = last(cars);
  return prop("in_stock", last_car || ({} as Car));
};

interface Fun {
  (...args: any[]): any;
}

export function sign<A, R = A>(fn: (a: A) => R) {
  return function (a: A): R {
    return fn(a);
  };
}

function last<T>(as: T[]): T | undefined {
  return as[as.length - 1];
}

function head<T>(as: T[]): T | undefined {
  return as[0];
}

function createCar(): Car {
  return {
    name: "no name",
    dollar_value: 0,
    horsepower: 0,
    in_stock: false,
  };
}

/**
 * Typescript sometimes has a hardtime trying to infer typing when using
 * Generic functions and right-to-left composition. So we may use a helper function
 * To "determine" which is the entry and output of the function given.
 */
export const isLastInStock2 = compose(
  prop("in_stock"),
  sign<Car | undefined, Car>(defaultTo(createCar())),
  sign<Cars, Car | undefined>(last)
);

/**
 * Using flow, that has a left-to-right composition
 * works way better without the need of the helper funciton.
 * But still, we have to assign a signature in the beginning
 * Otherwhise typescript won't know what is the entry of this function.
 */
export const isLastInStock3: (cars: Cars) => boolean = flow(
  last,
  defaultTo(createCar()),
  prop("in_stock")
);

// Use _.compose(), _.prop() and _.head() to retrieve the name of the first car.
export const nameOfFirstCar: (cars: Cars) => string = compose(
  prop("name"),
  sign<Car | undefined, Car>(defaultTo(createCar())),
  sign<Cars, Car | undefined>(head)
);

/**
 * Again, easy to see how better it looks.
 * We may also type it on the first function, if we
 * dont mind losing the point-free style.
 * This way, we don't need to sign the function, even though it is
 * kinda like a better way to garantee that you return what you expect.
 */
export const nameOfFirstCar2 = flow(
  (cs: Cars) => head(cs),
  defaultTo(createCar()),
  prop("name")
);

export const average = (xs: number[]) => reduce(add, 0, xs) / xs.length;

export const averageDollarValue = (cars: Cars) => {
  const dollarValues = map((c) => c.dollar_value, cars);
  return average(dollarValues);
};

export const averageDollarValue2: (cars: Cars) => number = compose(
  average,
  map((c) => c.dollar_value)
);

export const underscore = replace(/\W+/g, "_");

export const sanitizeNames: (cars: Cars) => string[] = compose(
  map(underscore),
  map(toLower),
  map(prop("name"))
);

const accounting = {
  formatMoney(value: number) {
    return Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  },
};

export const availablePrices = function (cars: Cars) {
  var available_cars = filter(prop("in_stock"), cars);
  return available_cars
    .map(function (x) {
      return accounting.formatMoney(x.dollar_value);
    })
    .join(", ");
};

export const availablePrices2: (cars: Cars) => string = compose(
  join(", "),
  map(accounting.formatMoney),
  map(prop("dollar_value")),
  filter(prop("in_stock"))
);

export const fastestCar = function (cars: Cars) {
  var sorted = sortBy(function (car) {
    return car.horsepower;
  }, cars);
  var fastest = last(sorted) || createCar();
  return fastest.name + " is the fastest";
};

interface Arity1<P, R = P> {
  (p: P): R;
}

interface ArityN<P extends any[], R = P> {
  (...p: P): R;
}

/**
 * Composed, but not pointfree.
 * See, we are using "name" in the last function.
 */
export const fastestCar2: Arity1<Cars, string> = compose(
  (name) => `${name} is the fastest`,
  prop("name"),
  sign<Car | undefined, Car>(defaultTo(createCar())),
  last,
  sortBy(prop("horsepower"))
);

/**
 * Concat whould give us:
 *
 * concat = (x) => (y) => `${x}{y}`
 * But since we want our X value at the end, we may flip it:
 * flip(concat) = concat => (y) => (x) => `${x}${y}`
 *
 * Now, pointfree!
 */
export const fastestCar3: Arity1<Cars, string> = compose(
  flip(concat)(" is the fastest"),
  prop("name"),
  sign<Car | undefined, Car>(defaultTo(createCar())),
  last,
  sortBy(prop("horsepower"))
);
