import { ResultAsync, errAsync } from './'

export type Result<T, E> = Ok<T, E> | Err<T, E>

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const ok = <T, E>(value: T): Ok<T, E> => new Ok(value)

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const err = <T, E>(err: E): Err<T, E> => new Err(err)

export class Ok<T, E> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  map<A>(f: (t: T) => A): Result<A, E> {
    return ok(f(this.value))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapErr<U>(_f: (e: E) => U): Result<T, U> {
    return ok(this.value)
  }

  // add info on how this is really useful for converting a
  // Result<Result<T, E2>, E1>
  // into a Result<T, E2>
  andThen<U>(f: (t: T) => ResultAsync<U, E>): ResultAsync<U, E>
  andThen<U>(f: (t: T) => Result<U, E>): Result<U, E>
  andThen<U>(f: (t: T) => Result<U, E> | ResultAsync<U, E>): Result<U, E> | ResultAsync<U, E> {
    return f(this.value)
  }

  asyncMap<U>(f: (t: T) => Promise<U>): ResultAsync<U, E> {
    return ResultAsync.fromPromise(f(this.value))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match = <A>(ok: (t: T) => A, _err: (e: E) => A): A => {
    return ok(this.value)
  }

  _unsafeUnwrap(): T {
    return this.value
  }

  _unsafeUnwrapErr(): E {
    throw new Error('Called `_unsafeUnwrapErr` on an Ok')
  }
}
// async function fetchApi(): Promise<string> {
//   return Promise.resolve('haha')
// }

// function resultsFromApi(): ResultAsync<string, Error> {
//   return ResultAsync.fromPromise(fetchApi())
// }

// const res = new Ok<string, Error>('hello').map(async str => str + ' world')

export class Err<T, E> {
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<A>(_f: (t: T) => A): Result<A, E> {
    return err(this.error)
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return err(f(this.error))
  }

  andThen<U>(_f: (t: T) => Result<U, E>): Result<U, E>
  // Since _f is ignored for Err, the return type is always a Result
  andThen<U>(_f: (t: T) => ResultAsync<U, E>): Result<U, E>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  andThen<U>(_f: (t: T) => Result<U, E> | ResultAsync<U, E>): Result<U, E> {
    return err(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncMap<U>(_f: (t: T) => Promise<U>): ResultAsync<U, E> {
    return errAsync<U, E>(this.error)
  }

  match = <A>(_ok: (t: T) => A, err: (e: E) => A): A => {
    return err(this.error)
  }

  _unsafeUnwrap(): T {
    throw new Error('Called `_unsafeUnwrap` on an Err')
  }

  _unsafeUnwrapErr(): E {
    return this.error
  }
}
