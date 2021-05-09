import { flow, pipe } from "fp-ts/lib/function";
import {
  prop,
  Functor,
  identity,
  partial,
  add,
  concat,
  toString,
  compose,
  split,
  map,
  last,
  filter,
  equals,
  head,
  sortBy,
} from "ramda";
import dayjs, { Dayjs } from "dayjs";
import { sign } from "../ch5/exercises";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/T";
import * as E from "fp-ts/Either";
import * as I from "fp-ts/IO";

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
  Maybe.map(prop("street")),
);

type Account = {
  balance: number;
};

export const withdraw: (n: number) => (a: Account) => Maybe<Account> = (
  amount,
) => ({ balance }) =>
  Maybe.of<Account>(balance >= amount ? { balance: balance - amount } : null);

export const remainingBalance = ({ balance }: Account) =>
  `Your balance is $${balance}`;

/** hypothetical */
const updateLedger: (a: Account) => Account = identity;

const finishTransaction: (a: Account) => string = flow(
  updateLedger,
  remainingBalance,
);

export const getTwenty = flow(withdraw(20), Maybe.map(finishTransaction));
export const getTwenty2 = flow(
  withdraw(20),
  partial(Maybe.fold, ["You're broke.", finishTransaction]),
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
  concat("If you survive, you will be "),
);

export const zoltar: (u: User) => Either<string, void> = flow(
  getAgeC(dayjs()),
  Either.map(fortune),
  Either.map(console.log),
);

export const zoltar2 = flow(
  getAgeC(dayjs()),
  Either.fold(identity, fortune),
  console.log,
);

type IOFunction = () => any;

export class IO<A> {
  constructor(public readonly unsafePerformIO: () => A) {}

  of<A>(a: A) {
    return new IO(() => a);
  }

  ["fantasy-land/map"]: <B>(fn: (a: A) => B) => Functor<B>;
  map<B>(f: (a: A) => B) {
    return new IO(compose(f, this.unsafePerformIO));
  }

  static map<A, B>(f: (a: A) => B) {
    return function (fa: IO<A>) {
      return fa.map(f);
    };
  }
}

const windowIO = new IO(() => window);
windowIO.map((w) => w.innerWidth);

const href = windowIO
  .map((w) => w.location)
  .map((l) => l.href)
  .map((h) => h.split("/"))
  /** Pull the trigger... */
  .unsafePerformIO();

console.log(href);

const $ = function (selector: string) {
  return new IO(() => document.querySelectorAll(selector));
};

const innerHtml = $("#myDiv")
  .map((es) => es[0])
  .map((div) => div.innerHTML)
  /** Pull the trigger... */
  .unsafePerformIO();

console.log(innerHtml);

const url = windowIO.map((w) => w.location).map((l) => l.href);

const toPairs: (s: string) => string[][] = flow(split("&"), map(split("=")));
const params = flow(split("?"), last, toPairs);
const findParams = (key: string) => {
  return url
    .map(params)
    .map(filter(flow(head, equals(key))))
    .map(safeHead);
};

const findParamsComposed = (key: string) => {
  return map(flow(params, filter(flow(head, equals(key))), safeHead), url);
};

console.log(findParams("color").unsafePerformIO());
console.log(findParamsComposed("color").unsafePerformIO());

type TaskFunction<A> = (a: A) => void;

const IdService = {
  refs: [] as [object, number][],
  getId(ref: object): number {
    const found = this.refs.find(([inside, id]) => inside === ref);

    if (found) {
      return found[1];
    }

    const id = Math.random();
    this.refs.push([ref, id]);

    return id;
  },
};

/**
 * A task is an async code that (should) NEVER fails.
 */
class Task<R> {
  constructor(public readonly evaluate: (resolve: TaskFunction<R>) => void) {}

  map<B>(f: (a: R) => B): Task<B> {
    /**
     * Composition here looks "inverted"
     * maybe because the tasks run in a "inverted" fashion
     * We are piling the resolved values...
     */
    return new Task((g) => this.evaluate(compose(g, f)));
  }

  chain<B>(f: (a: R) => Task<B>): Task<B> {
    return new Task<B>((resolve) =>
      this.evaluate((a) => f(a).evaluate(resolve)),
    );
  }

  static fromPromise<R>(promise: Promise<R>) {
    return new Task<R>((resolve) => promise.then(resolve));
  }

  static fromThunk<L, R>(thunk: () => Promise<R>) {
    return new Task<R>((resolve) => thunk().then(resolve));
  }

  static of<A>(a: A) {
    return new Task<A>((resolve) => {
      resolve(a);
    });
  }
}

/** FS Mock */
const fs = {
  readFile: (fileName: string) =>
    new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5
          ? resolve(
              "One morning, as Gregor Samsa was waking up from anxious dreams, he discovered that in bed he had been\nchanged into a monstrous verminous bug.",
            )
          : reject(new Error(`Could not find file ${fileName}.`));
      }, Math.random() * 5000);
    }),
};

const readFile = (fileName: string) =>
  Task.fromThunk(() => fs.readFile(fileName));

const fetchT = (info: RequestInfo, init?: RequestInit) =>
  Task.fromThunk(() => fetch(info, init));

readFile("metamorphosis").map(split("\n")).map(head).evaluate(console.log);

type Movie = {
  Title: string;
};
type Search = Movie[];
type APIResponse = {
  Search: Search;
};

const json = <A>(response: Response) => response.json() as Promise<A>;

fetchT("https://fake-movie-database-api.herokuapp.com/api?s=Batman")
  .chain(flow(sign<Response, Promise<APIResponse>>(json), Task.fromPromise))
  .map(prop("Search"))
  .map(safeHead)
  .map(Maybe.map(prop("Title")))
  .evaluate(console.log);

Task.of(3)
  .map((three) => three + 1)
  .evaluate(console.log);

/**
 * Hypothetical Pure Application
 */
type Post = {
  date: Date;
};
type Posts = Post[];

declare function blogPage(ps: Posts): HTMLElement;

const renderPage: (ps: Posts) => HTMLElement = compose(
  blogPage,
  sortBy((a) => a.date),
);

declare function getJSON(
  url: RequestInfo,
): (params: RequestInit) => TE.TaskEither<Error, Posts>;

const blog: (
  params: RequestInit,
) => TE.TaskEither<Error, HTMLElement> = compose(
  TE.map(renderPage),
  getJSON("/posts"),
);

/**
 * Hypothetical Impure Calling
 */

const invoke = blog({});

invoke().then(
  E.fold(
    /** Either.Left */
    console.error,
    (el) => document.body.append(el),
  ),
  /** Task failure */
  console.error,
);

/**
 * Hypothetical Pure Application
 */
type Filename = string;
type Url = string;
type DbConnection = {};

const Postgres = {
  connect(url: Url): I.IO<DbConnection> {
    return () => ({});
  },
};

type Config = {
  uname: string;
  pass: string;
  host: string;
  db: string;
};

// dbUrl :: Config -> Either Error Url
const dbUrl = ({ uname, pass, host, db }: Config): E.Either<Error, Url> => {
  if (uname && pass && host && db) {
    return E.right(`db:pg://${uname}:${pass}@${host}5432/${db}`);
  }

  return E.left(Error("Invalid config!"));
};

// connectDb :: Config -> Either Error (IO DbConnection)
const connectDb: (c: Config) => E.Either<Error, I.IO<DbConnection>> = compose(
  E.map(Postgres.connect),
  dbUrl,
);

const FS = {
  // readFile :: String -> Task Error String
  readFile(fileName: Filename): T.Task<Error, string> {
    return Task.of(fileName);
  },
};

const toConfig = (content: string) => JSON.parse(content) as Config;

// getConfig :: Filename -> Task Error (Either Error (IO DbConnection))
const getConfig: (
  fileName: Filename,
) => TE.TaskEither<Error, E.Either<Error, I.IO<DbConnection>>> = compose(
  T.map(compose(connectDb, toConfig)),
  FS.readFile,
);

type ResultSet = {};

// runQuery :: DbConnection -> ResultSet
declare function runQuery(conn: DbConnection): ResultSet;

// -- Impure calling code ----------------------------------------------

pipe(
  getConfig("db.json"),
  /** Maybe failed to read the file, or read the configuration */
  TE.chain(TE.fromEither),
  /** Maybe failed to open the connection */
  TE.chain(TE.fromIO),
  /** If everything is OK, just runQuery */
  TE.map(runQuery),
  /** Otherwhise, just log the error. */
  TE.mapLeft(console.error),
);
