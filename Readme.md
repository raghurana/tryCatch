# try-catch-util

A tiny TypeScript utility for typed `try/catch` results.

`tryCatch` returns a destructurable `{ result, error }` object. The main benefit: `error` is typed as `Error` by default, or as the custom error generic you provide, so you do not have to cast caught values before using `message` or custom fields.

## Install

```sh
npm install try-catch-util
```

## Example 1: Default Error

```ts
import { tryCatch } from 'try-catch-util';

type TodosResponse = {
  todos: Array<{ id: number; todo: string; completed: boolean; userId: number }>;
  total: number;
  skip: number;
  limit: number;
};

const { result, error } = await tryCatch<TodosResponse>(async () => {
  const response = await fetch('https://dummyjson.com/todos');
  if (!response.ok) throw new Error(`Failed to load todos: ${response.status}`);
  return response.json() as Promise<TodosResponse>;
});

if (error) console.error(error.message);
else console.log(result.todos);
```

`error` is typed as `Error`, so `error.message` needs no cast.

## Example 2: Custom Error Generic

```ts
import { tryCatch } from 'try-catch-util';

class TodosApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'TodosApiError';
  }
}

const { result, error } = await tryCatch<TodosResponse, TodosApiError>(async () => {
  const response = await fetch('https://dummyjson.com/todos');
  if (!response.ok) throw new TodosApiError('Unable to load todos', response.status);
  return response.json() as Promise<TodosResponse>;
});

if (error) console.error(error.status, error.message);
else console.log(result.todos.map((todo) => todo.todo));
```

`error` is typed as `TodosApiError`, so `error.status` needs no cast.

## TypeScript Result Type

```ts
type Success<T> = { result: T; error?: never };
type Failure<E> = { result?: never; error: E };
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;
```

You can import the types when you want to describe helper return values.

```ts
import type { Result } from 'try-catch-util';
```

## API

```ts
function tryCatch<T, E extends Error = Error>(input: () => Promise<T> | T): Promise<Result<T, E>>;
```

> Note: If a function throws or rejects with a string, `tryCatch` converts it into an `Error` instance. Other thrown values are preserved as-is.

## License

MIT
