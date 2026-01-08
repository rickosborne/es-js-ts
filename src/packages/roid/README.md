# @rickosborne/roid

A `roid` is my own custom flavor of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID), intended to replace longer UUID, GUID, and ULID in small projects.
The concepts are the same, but tweaked a bit for my own preferences.
They are Base56-encoded 64-bit numbers, yielding 11-character strings.
This fixed length, combined with the Base56 character set, means both the number and the strings are sortable by creation time and URL-safe.

Does not need any runtime dependencies.
Works as either CJS or ESM.

## Fields

Differences from standard Snowflake IDs:

- The leading bits are changed from just `0` to `01`.
  This forces the encoded strings to always end up 11 characters long, so you don't end up with something like `abc` sorting before `de`.
- Machine identifiers are 12 bits and default to a memoized random number on the first call.
- Sequence numbers are 8 bits, because most of us aren't running at a scale where we'll need more than 256 new IDs in the same millisecond.
- The (default) epoch is the first second of 2026.

This yields bits like:

<table>
	<thead>
		<tr>
			<th>0</th>
			<th>1</th>
			<th>2</th>
			<th>3</th>
			<th>4</th>
			<th>5</th>
			<th>6</th>
			<th>7</th>
			<th>8</th>
			<th>9</th>
			<th>10</th>
			<th>11</th>
			<th>12</th>
			<th>13</th>
			<th>14</th>
			<th>15</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>0</td>
			<td>1</td>
			<td colspan="14">timestamp</td>
		</tr>
		<tr>
			<td colspan="16">timestamp</td>
		</tr>
		<tr>
			<td colspan="12">timestamp</td>
			<td colspan="4">machine</td>
		</tr>
		<tr>
			<td colspan="8">machine</td>
			<td colspan="8">sequence</td>
		</tr>
	</tbody>
</table>

With a 42-bit timestamp, the maximum date is in 2165.

The smallest roid is `HDU8U8Pz8Na`, while the largest is `YQwEwEmyEj9`.

## Base56

The Base56 characters set used is:

```
23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz
```

This omits letters and numbers which may be easily confused, such as `1` vs `l` and `0` vs `O` or `o`.
The lack of punctuation means roids are both URL-safe and filesystem-safe.

## Usage

If my defaults seem reasonable to you, import and call `roid()`:

```typescript
import { roid } from "@rickosborne/roid/roid.js";

const id = roid();  // 11-character string
```

If you are running in a long-lived environment, like EC2, you may want to set the machine identifier to some fixed number you control.
It allows up to 12 bits, so the number should be between `0` and `4095`.
Otherwise, a random number will be generated and memoized.

```typescript
// In your startup, once.
roid.machineId = 1234;
// Later calls use that saved machine identifier.
const id = roid();
```
The `roid()` call also accepts options object you can provide if you want really fine-grained control:

```typescript
interface RoidOptions {
	/**
	 * The earliest possible timestamp.
	 * Defaults to the first second of 2026.
	 */
	epoch?: number;
	/**
	 * An integer in the range `[0,4095]`.
	 */
	machineId?: number;
	/**
	 * A function which provides an integer in the range `[0,4095]`.
	 */
	machineIdProvider?: () => number;
	/**
	 * An integer in the range `[0,255]`.
	 */
	sequenceNumber?: number;
	/**
	 * Override the default behavior of picking a random number
	 * as the start of each sequence number.
	 */
	sequenceStarter?: SequenceStarter;
	/**
	 * Usually, the result of `Date.now()`.
	 */
	time?: number;
	/**
	 * Defaults to `Date.now`, but can be overridden for tests
	 * or because you have your own clock.
	 */
	timeProvider?: NowProvider;
	/**
	 * The value of `time - epoch`.
	 * Generally only used for testing.
	 */
	timestamp?: number;
}
```

So that same specific-machine-identifier call could also look like:

```typescript
const id = roid({ machineId: 1234 });
```

The randomly generated machine identifier can also be read from `roid.machineId`, if you want to add it to logs.
Similarly, `roid.machineIdProvider`, `roid.epoch` and `roid.timeProvider` are also available to read and write.

There is no way to manipulate the internal state for sequence number and previous-time tracking.

## Parsing a roid

You can also extract the constituent integers from a roid:

```typescript
import { parseRoid } from "@rickosborne/roid/parse-roid.js";

const { machineId, sequenceNumber, timestamp, uint64 } = parseRoid(id);
```

While `parseRoid` will throw an error if there are any problems, you can use `safeParseRoid` if you would prefer to return the error:

```typescript
import { safeParseRoid } from "@rickosborne/roid/parse-roid.js";

const [ error, parsed ] = parseRoid(id);
if (parsed != null) {
	// You can now access parsed.timestamp, etc.
} else {
	// log out the error and recover
}
```

## Utility functions

The `roid` function also has several utility functions attached:

```typescript
// There are several `isSafe*` and `assertSafe*` guards.
if (!roid.isSafeMachineId(machineId)) {
	// fall back to some safe value
}
```

You can also access the low-level bits-to-bigint packer:

```typescript
const [ error, maybeId ] = roid.safePack(timestamp, machineId, sequenceNumber);
// Or if you want to just throw and catch:
const id = roid.pack(timestamp, machineId, sequenceNumber);
```

If you'd prefer a version of `roid()` which returns errors instead of throwing, that's in `roid.safe(options?: RoidOptions)`.

See the `RoidFoundations` type for more details.

## Sequence Numbers

When generating sequence numbers, the default behavior is to generate a random in the range `[0..127]`, which is the lower half of the full sequence number range.
You can override this by setting a `roid.sequenceStarter` function, or providing a function to the `sequenceStarter` option.

There's also a `ROID_SEQUENCE_FROM_ZERO` constant you can use which does exactly what it says:

```typescript
// Closer to original Snowflake ID behavior:
roid.sequenceStarter = ROID_SEQUENCE_FROM_ZERO;
// Closer to ULID behavior:
roid.sequenceStarter = ROID_SEQUENCE_FROM_RANDOM;
// Or just make your own:
roid.sequenceStarter = () => Date.now() & 0b00010101;
```

Keep in mind that the generator will error out if the sequence number goes over 255.
It will _not_ just silently roll over.

## License

This package is licensed as [CC-BY-NC-SA-4.0].
That is, Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.

[CC-BY-NC-SA-4.0]: https://creativecommons.org/licenses/by-nc-sa/4.0/
