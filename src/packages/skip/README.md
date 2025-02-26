# @rickosborne/skip

Tools for working with Step Functions and [States Language](https://states-language.net/).
This is not super robust, and certainly would never work in any serious production capacity.
It should, however, be sufficient for most basic use-cases and local testing.

Alternatives:

- [asl-types](https://www.npmjs.com/package/asl-types) - TypeScript types module that makes it easier to create AWS Step Functions JSON.
- [asl-validator](https://www.npmjs.com/package/asl-validator) - A simple Amazon States Language validator based on JSON schemas.

Built on top of:

- [@rickosborne/foundation](https://www.npmjs.com/package/@rickosborne/foundation) for data structures and general helpers
- [@rickosborne/guard](https://www.npmjs.com/package/@rickosborne/guard) for TypeScript guards
- [@rickosborne/typical](https://www.npmjs.com/package/@rickosborne/typical) for helper TypeScript type definitions

## Example

As a simple example, based on one from the spec, presume you have a Lambda function which adds two numbers.  Its implementation might be:

```typescript
export function add(numbers: { val1: number; val2: number }): number {
	return numbers.val1 + numbers.val2;
}
```

That function could accept an input of:

```json
{
	"val1": 3,
	"val2": 4
}
```

> Aside: Function arguments always arrive as a single value.  Even if you provide an array, it will just be an array as the first value.

Your State Machine definition around that function might look like:

```json
{
	"StartAt": "Add",
	"States": {
		"Add": {
			"End": true,
			"Resource": "arn:aws:lambda:us-east-1:123456789012:function:Add",
			"Type": "Task"
		}
	}
}
```

Presumably, you already have unit tests for the `add` function.
But what if you want to test your State Machine definition?

Enter the `runStateMachine` function from this library:

```typescript
// Import the State Machine runner.
import { runStateMachine } from "@rickosborne/skip";
// Import your implementation from its source.
import { add } from "../add.js";
// Import the State Machine definition as JSON.  Or read it from a file.  Or use a literal.
import addStateMachine from "../state-machines/add.json" with { type: "json" };

describe(add.name, () => {
	test("valid inputs", async () => {
		// The runner is always asynchronous.  There is no synchronous API.
		const result = await runStateMachine(addStateMachine, {
			input: {
				val1: 3,
				val2: 4,
			},
			// As the State Machine definition uses Resource ARNs, you need
			// to tell the runner how to resolve those ARNs to local functions.
			// You can do this as a simple Record, or you could provide a
			// resolver function.
			fnForResource: {
				[addStateMachine.States.Add.Resource]: add,
			}
		});
		// Assert the correct result was returned.
		expect(result, "result").eq(7);
	});
});
```

That `runStateMachine` function's configuration object has additional properties for things like:

- `nowProvider` — Inject a stable replacement for `Date.now()`.  (Note that this _will not_ be injected into your implementation functions.  If you need such a thing, you'll need to partially apply your function with the replacement.)
- `onHeartbeatSeconds` — Simulate heartbeat failures and successes.
- `onMaxInputBytesPerBatch` — Micromanage input batches based on input size.
- `onRetry` — Observe and modify failure retries.
- `onStateComplete` — Observe state transitions and their current context values, like inputs and outputs.
- `onWait` — Simulate various wait conditions and asynchronous completion.

See the docs for `RunStateMachineOptions` for details.

See the [examples.test.ts](./__test__/examples.test.ts) unit tests for more extensive examples.

## How complete is it?

It's not a robust production-ready implementation, but it should be sufficient for most tasks.

- It uses the [jsonata](https://www.npmjs.com/package/jsonata) library, and wires up the `$states` bindings, so most/all JSONata expressions should work.
- It uses the [jsonpath](https://www.npmjs.com/package/jsonpath) library, and resolves all the `*Path` properties, so most/all JSONPath expressions should work.
- All Data Test Expressions for JSONPath are implemented.  (i.e. `StringMatches`, `TimestampGreaterThan`, etc.)
- All Intrinsic Functions are implemented.  (i.e. `States.Hash`, `States.JsonMerge`, etc.)
- `Parallel` tasks are actually run in parallel via promises.  (Not Web Workers, though, so you're still on a single thread.)
- `Map` tasks are batched and also run in parallel according to the `MaxConcurrency` configuration.
- `Timeout` values are checked.  (To support faster unit tests, this implementation allows decimal timeouts, not just integers as the spec dictates.  So `0.25` is a quarter-second timeout, for example.)

So ... what doesn't work?

- Any `Heartbeat` configuration does not actually use heartbeats.  Instead, you can configure a callback to decide whether to simulate a heartbeat failure.
- By default, `Wait` won't actually wait.  You can, however, provide an async function which will be `await`-ed, if you really do want to sleep some amount of time.
- Errors are dodgy.  The spec isn't great at specifying where some/most of the `States.*` errors come into play.  I've made my best guess, but your `Retry` and `Choices` may need to include a few extra `Error` names (mostly `SyntaxError`) which AWS's implementation will likely just ignore.
- Some `Assign` versus `Output` handling may be busted.  Again, the spec is super unclear on exactly how these should interact.  If you have a working-in-the-cloud example of how they interact, let me know!
- Try/`Catch`/`Retry` may not match AWS cloud execution.  It's been tested to handle "reasonable" cases, but nowhere near exhaustively.

Or, put simple: it mostly works, but there are likely to be sharp edges here and there.
