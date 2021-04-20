import { flow } from "fp-ts/lib/function";
import {
  prop,
  Functor,
  identity,
  curry,
  partial,
  add,
  concat,
  curryN,
  toString,
} from "ramda";
import dayjs, { Dayjs } from "dayjs";

export class Container<A> {
  private $value: A;

  constructor(value: A) {
    this.$value = value;
  }

  static of<T>(x: T) {
    return new Container(x);
  }

  map<B>(f: (a: A) => B): Container<B> {
    return Container.of<B>(f(this.$value));
  }
}

export type Nullable<A> = A | null;

export abstract class Maybe<A> {
  protected $value: A;

  constructor(value: A) {
    this.$value = value;
  }

  abstract map<B>(f: (a: A) => B): Maybe<B>;
  abstract ["fantasy-land/map"]: <B>(fn: (a: A) => B) => Functor<B>;

  get isNothing() {
    const { $value } = this;

    return $value === null || $value === undefined;
  }

  static isNothing<A>(a?: Nullable<A>) {
    return a === null || a === undefined || Number.isNaN(a);
  }

  static isSomething<A>(a?: Nullable<A>): a is A {
    return !this.isNothing(a);
  }

  static of<A>(a?: Nullable<A>): Maybe<A> {
    return Maybe.isSomething(a) ? new Just(a) : new Nothing();
  }

  static map<A, B>(f: (a: A) => B) {
    return function (fa: Maybe<A>): Maybe<B> {
      return fa.map(f);
    };
  }

  static get Nothing() {
    return new Nothing();
  }

  static foldC<B>(b: B) {
    return function <A2>(f: (a: A2) => B) {
      return function (fa: Maybe<A2>) {
        return Maybe.fold(b, f, fa);
      };
    };
  }

  static fold<A, B>(b: B, f: (a: A) => B, fa: Maybe<A>) {
    return fa.isNothing ? b : f(fa.$value);
  }
}

export class Just<A> extends Maybe<A> {
  ["fantasy-land/map"]: <B>(fn: (a: A) => B) => Functor<B>;
  map<B>(f: (a: A) => B): Maybe<B> {
    return Maybe.of(f(this.$value));
  }
}

export class Nothing extends Maybe<never> {
  constructor() {
    super(null as never);
  }

  ["fantasy-land/map"]: <B>(fn: (a: never) => B) => Functor<B>;
  map<B>(_: (a: never) => B): Maybe<B> {
    return this;
  }
}

export const safeHead: <A>(as: A[]) => Maybe<A> = (as) => Maybe.of(as[0]);

type Address = {
  street: string;
  number: number;
};

type AddressBook = {
  addresses: Address[];
};

export const streetName: (o: AddressBook) => Maybe<string> = flow(
  prop("addresses"),
  safeHead,
  Maybe.map(prop("street"))
);

type Account = {
  balance: number;
};

export const withdraw: (n: number) => (a: Account) => Maybe<Account> = (
  amount
) => ({ balance }) =>
  Maybe.of<Account>(balance >= amount ? { balance: balance - amount } : null);

export const remainingBalance = ({ balance }: Account) =>
  `Your balance is $${balance}`;

/** hypothetical */
const updateLedger: (a: Account) => Account = identity;

const finishTransaction: (a: Account) => string = flow(
  updateLedger,
  remainingBalance
);

export const getTwenty = flow(withdraw(20), Maybe.map(finishTransaction));
export const getTwenty2 = flow(
  withdraw(20),
  partial(Maybe.fold, ["You're broke.", finishTransaction])
);

export abstract class Either<L, R> {
  constructor(protected $value: L | R) {}

  static of<R>(value: R): Either<never, R> {
    return new Right(value);
  }

  abstract map<B>(f: (a: R) => B): Either<L, B>;

  static left<A>(a: A): Either<A, never> {
    return new Left(a);
  }

  static map<R2, B>(f: (a: R2) => B) {
    return function <L2>(fa: Either<L2, R2>): Either<L2, B> {
      return fa.map(f);
    };
  }

  static fold<L, R, B>(f: (l: L) => B, g: (r: R) => B) {
    return function (fa: Either<L, R>) {
      switch (true) {
        case fa instanceof Left:
          return f((fa as Left<L>).$value);
        case fa instanceof Right:
          return g((fa as Right<R>).$value);
      }
    };
  }
}

class Left<L> extends Either<L, never> {
  map<B>(_: (a: never) => B): Left<L> {
    return this;
  }
}

class Right<R> extends Either<never, R> {
  map<B>(f: (a: R) => B): Either<never, B> {
    return Either.of(f(this.$value));
  }
}

type User = {
  birthDate: string;
};

export const getAge = (now: Dayjs, user: User): Either<string, number> => {
  const birthDate = dayjs(user.birthDate, "YYYY-MM-DD");

  return birthDate.isValid()
    ? Either.of(now.diff(birthDate, "years"))
    : Either.left("Birth date could not be parsed");
};

export const getAgeC = (now: Dayjs) => (user: User) => getAge(now, user);

export const fortune: (n: number) => string = flow(
  add(1),
  toString,
  concat("If you survive, you will be ")
);

export const zoltar: (u: User) => Either<string, void> = flow(
  getAgeC(dayjs()),
  Either.map(fortune),
  Either.map(console.log)
);

export const zoltar2 = flow(
  getAgeC(dayjs()),
  Either.fold(identity, fortune),
  console.log
);
