export type Success<T> = { result: T; error?: never };
export type Failure<E> = { result?: never; error: E };
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Executes a synchronous or asynchronous function and returns a typed result object.
 *
 * Successful executions resolve with `{ result }`, while thrown errors resolve with
 * `{ error }`. If a string is thrown, it is converted into an `Error` instance.
 *
 * @param input - Function to execute safely.
 * @returns A promise containing either the function result or the captured error.
 */
export async function tryCatch<T, E extends Error = Error>(input: () => Promise<T> | T): Promise<Result<T, E>> {
  try {
    const result = await input();
    return { result };
  } catch (e) {
    const error = typeof e === 'string' ? (new Error(String(e)) as E) : (e as E);
    return { error };
  }
}
