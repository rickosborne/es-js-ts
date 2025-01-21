# Range Scaling

When working with numeric ranges (via [NumberRange]), you may want to be able to automatically scale between two ranges.
For example, while RGB colors are most often expressed in the `[0..255]` range, HSL colors use `[0,360)` for the hue and `[0,1]` for the saturation and luminance/brightness.

[NumberRange]: ../number-range.ts

> For clarity, this doc and its code follow the convention that integer ranges use `..` between the bounds, while real/float/decimal ranges use `,` between the bounds.
> Similarly, `[]` square brackets denote closed/inclusive bounds, while `()` parentheses denote open/exclusive bounds.

In the abstract, this sounds simple.
To convert a value from `[0..255]` to `[0,1]` you just divide by `255`, right?
But what if that `[0..255]` integer range is instead expressed as real range `[0,256)`?
What is your divisor, then?

This is a trick question, of course.

What would it mean to scale between a closed bound `..255]` and an open one `..256)`?
Or the reverse?
You might, in the simplest of cases, say that going from `..256)` to `..255]` is just a truncate/floor operation.

> You'll note that `IntegerRange` does not allow open/exclusive bounds.
> This is more out of practicality than anything else.
> Why express an integer range of `[0..360)` when, for all practical purposes, that range is actually `[0..359]`?

So we have a combination of integer versus real, open versus closed, and the direction of the operation.
Let's build out a truth table.
Here, the "from" range is down the left (rows) anf the "to" range is along the top (columns).

| &nbsp;   | `[c..d]` | `[c,d)` | `[c,d]` | `(c,d)` | `(c,d]` |
|----------|----------|---------|---------|---------|---------|
| `[a..b]` | easy     | ?       | easy    | tricky  | ?       |
| `[a,b)`  | cheat    | easy    | ?       | ?       | ?       |
| `[a,b]`  | easy     | ?       | easy    | medium  | ?       |
| `(a,b)`  | cheat    | ?       | medium  | easy    | ?       |
| `(a,b]`  | cheat    | ?       | ?       | ?       | easy    |

Let's look at the easy cases first.

## Real closed to Real closed

This is the easiest case, and shows off the basic process which is the template for the other versions.
This will be a bit remedial, but sets up the vocabulary for the harder stuff later.

Visually, say you have the real range `[1,5]`, representing the Stars for a film review:

```
          [       Stars       ]
<----|----|----|----|----|----|----|--->
     0    1    2    3    4    5    6
```

So you could score 5⭐️ for the best and 1⭐️ for the worst, and something like 2½⭐️ for something middling.

But then you want to share data with a source which uses a `[0,100]` Grade to mean the same thing.

```
     [       Grade       ]
<----|----|----|----|----|---->
     0    25   50   75  100
```

Before we get into the technical stuff, let's start with an assumption/expectation:

> As both ranges are closed/inclusive, we expect the values for the bounds to translate.
> That is, we expect 1⭐ to be a Grade of 0, and 5⭐ to be a Grade of 100.

The process for scaling from Stars to Grade is then:

1. Translate the Stars value so that its lower bound becomes `0`.  That is, since Stars starts at 1, we need to subtract 1 from the value.
2. Normalize the range of Stars to a width of `1`.  That is, since `5-1=4`, the range/width of Stars is `4`, so we divide the number by `4`.
3. Scale to the width of the output range, Grade, by reversing the last operation.  Since Grade's range is `100-0=100`, we multiply the value by `100`.
4. Translate the value back out by the lowest value possible in the target range.  As Grade starts at `0`, we don't need to do anything there.

In code:

```typescript
function scaleReal(value: number, before: Range, after: Range): number {
	// 1. Translate to zero from the range' lower bound
	const atZero = value - before.lower;
	// 2. Normalize to [0,1]
	const beforeWidth = before.upper - before.lower;
	const normalized = atZero / beforeWidth;
	// 3. Scale to the destination width
	const afterWidth = after.upper - after.lower;
	const scaled = normalized * afterWidth;
	// 4. Translate back out to the range's lower bound
	return scaled + after.lower;
}
```

This satisfies our expectations:

- 1⭐ gets translated in (`1-1=0`), normalized (`0/4=0`), scaled (`0*100=0`), and translated out (`0+0=0`) to become a Grade of `0`.
- 5⭐ gets translated in (`5-1=4`), normalized (`4/4=1`), scaled (`1*100=100`), and translated out (`100+0=0`) to become a Grade of `100`.
- We've checked the highest and lowest input values, so we know we can't violate the output bounds/constraints.
- For a value in the middle, 3⭐, the same transformations (`3-1=2`, `2/4=0.5`, `0.5*100=50`, `50+0=50`) yields `50`, which is intuitively a middle Grade, too.

If math is more your thing than code:

- Given: input range `[a,b]`, output range `[c,d]`.
- Given value `x` in `[a,b]`.
- Translate in to zero: `x - a`
- Normalize to one: `(x - a) / (b - a)`
- Scale: `(d - c) * (x - a) / (b - a)`
- Translate out: `y = c + (d - c) * (x - a) / (b - a)`

Barring floating-point math errors, converting between Real ranges should be reversible.
That is, for any `x` in `[a,b]` which yields `y` in `[c,d]`, we should be able to get exactly the same value of `x` if we swapped the inputs and outputs.

Let's do a quick test to be sure:

- Grade 100: `100-0=100`, `100/100=1`, `1*4=4`, `4+1=5`.  This yields 5⭐, as we expect.
- Grade 0: `0-0=0`, `0/100=0`, `0*4=0`, `0+1=1`.  This yields 1⭐, as we expect.

We could even show this with math by swapping `x` ↔︎ `y`, `a` ↔︎ `c` and `b` ↔︎ `d`:

```
Original: y = c + (d - c) * (x - a) / (b - a)
Swapped:  x = a + (b - a) * (y - c) / (d - c)
Solve for y:
x = a + (b - a) * (y - c) / (d - c)
x - a = (b - a) * (y - c) / (d - c)
(d - c) * (x - a) = (b - a) * (y - c)
(d - c) * (x - a) / (b - a) = (y - c)
∴ y = c + (d - c) * (x - a) / (b - a)
```

## Real open to Real open

This follows the exact same logic and code as above: translate in, normalize, scale, translate out.
Here, the fact that the bounds are open doesn't change anything, because the change is symmetrical across the bounds.

That is, `(a,b)` → `(c,d)` still works because even though you might get infinitely close to `a` or `b`, you'll never see them, so you won't have to worry about accidentally yielding exactly a `c` or `d`, violating your bounds.

## Real half-open

Here we have to divide into two groups: symmetrical and asymmetrical bounds.
That is:

- Symmetrical: `[a,b)` → `[c,d)` (both open-upper)
- Symmetrical: `(a,b]` → `(c,d]` (both open-lower)
- Asymmetrical: `[a,b)` → `(c,d]` (mismatched)
- Asymmetrical: `(a,b]` → `[c,d)` (mismatched)

The symmetrical scenarios, even though they are open ranges, work within the same expectations we've already seen.
Whether it's `a` and `c` which are open, or `b` and `d`, we can still scale, because we know we can't get an input which wouldn't make sense as an output.

But what about the asymmetric scenarios?

What would it mean to convert from `(a,b]` to `[c,d)`?
What would the value `b`, the starting upper bound, show up as in the destination range?
Should it be the closest number possible to `d`, the upper bound?
Or how would we even get a `c` if `a` isn't a valid input?

Think about the degenerate scenarios.
If you convert from `(0,1]` to `[0,1)`, what would an input value of `1` show up as for the output?
It's nonsensical, right?
The same holds true in reverse.

For this reason, `NumberRange` throws a `RangeError` if you try to convert between asymmetric-bounded Real ranges like this.

### Okay, but I wanna do it anyway.

You could pick some discrete value, call it epsilon or delta, with which to scale from a closed bound to an open one.
A buffer space.
But it would very much depend on your use cases.

For that reason, if you want to do it, define your own closed-bounded range `[c',d']` which is as close to `(c,d)` as you want, and use it for conversion.

## Integer to Integer

Converting between integer ranges follows the same basic process, plus one extra step:

1. Translate the input lower bound to `0`.
2. Normalize the input width to `[0,1]`.
3. Scale to the output width.
4. Translate out to the output lower bound.
5. Convert to an integer (round, mostly).

That last step breaks the reversibility we had with Real ranges.
That is, even if the first four steps are done with real/decimal numbers, converting to an integer in the last step will result in throwing away some information.
We then could not guarantee to be able to derive the original input from the output.

### Tangent: issues with rounding

Let's take an example: Bytes `[0..255]` to Degrees `[0..359]`.
They both start at `0`, so we can skip the translation steps.
Indeed, we can intuit that calculating Degrees from Bytes means multiplying by `359/255`.

```typescript
const degreesFromBytes = (value: number) => Math.round(value * 359 / 255);
```

Let's look at values close to the bounds:

| Bytes | Scaled | Degrees |
|------:|-------:|--------:|
|     0 |      0 |       0 |
|     1 |  ≈1.41 |       1 |
|     2 |  ≈2.82 |       3 |
|   253 | ≈356.2 |     356 |
|   254 | ≈357.6 |     358 |
|   255 |    359 |     359 |

This already shows us that there is no input Byte value which could yield an output of `2` Degrees, nor one which could yield `357` Degrees.

Intuitively, this makes sense: there are only 256 discrete values for Bytes, but 360 for Degrees.
Thus, not every discrete Degree value correspond to its own Byte value.

But something worse happens when we "round trip" values:

| Degrees |  Scaled | Bytes |  Scaled | Degrees |
|--------:|--------:|------:|--------:|--------:|
|       2 |   1.421 |     1 |   1.408 |       1 |
|       5 |   3.552 |     4 |   5.631 |       6 |
|     354 | 251.448 |   251 | 353.369 |     353 |
|     357 | 253.579 |   254 | 357.592 |     358 |

That is, we can end up with values where the conversion is not reversible.
Even worse, sometimes the "bad" result is too high, sometimes too low.

Long story short: if you need to regularly convert back and forth between ranges, don't use integers.
Or if you do, keep track of "original" or "source" values.

## Integer to Real closed

Converting `[a..b]` to `[c,d]` works exactly like you would expect: you treat `[a..b]` as if `[a,b]` and follow the same four steps.
As your output is a Real, you don't need to convert to an integer.

## Real closed to Integer

Converting `[c,d]` to `[a..b]` follows the Integer rules: same initial steps, round at the end.

### Tangent: why does `round()` work?

Why not `trunc()` or `floor()`?

The answer here is because of the step which normalizes the input range `[a,b]` to `[0,1]`.
Any value close to `a` will then be close to `0`, and any close to `b` will be close to `1`.
The next step to scale to `[c,d]` means those close-to-`0` values then become close-to-`c` values, and the same for `d`.

This means `round()` will work as it should: values close-to-`c` become `c`, and close-to-`d` become `d`.
No pesky "off by one" math here, like you might need with `trunc()` or `floor()`.

## Integer to half-open Real

That is:

- `[a..b]` → `[c,d)` or `(c,d]`

What would this even mean?
Are we back in the same place as asymmetric real-to-real?

Yes ... but also no.
We _could_ do these conversions, if we understand and accept what they actually mean.

When looking at (closed) integer ranges, remember that you have one more discrete number than you appear to have.
That is, the range `[0..255]` has `256` discrete values.
Even something as simple as `[0..1]` actually has two values, `0` and `1`, even though its "real" range is just `1`.

> Only singletons like `[0]` or `[255]` have just a single value.

We already know that any kind of Integer → Real conversion is going to involve discrete Real outputs.
This is the consequence of only accepting discrete integer inputs.

So ... could we use that to our advantage here?

For `[a..b]` → `[c,d)` we _could_ just divide up `[c,d)` in such a way that we knew we could never produce a `d`.

Let's take a degenerate example: `[0..1]` → `[0,1)`.  Our input integer values `0` and `1` could yield Real values `0` and `0.5`.  This would satisfy the `[0,1)` bounds.  We could even reverse the operation with `round()`.

We could generalize this to:

> When converting from Integer to open-upper Real, use the number of discrete integers (`b-a+1`) as the divisor instead of just `b-a`.

You can visualize this as dividing the normalized Real range into Integer "buckets", with one extra, such that the last one will never get used:

```
    <--|-----|-----|-----|-----|-----|->
Int:   [a    |     |     |     |    b]
+1     [a   |    |    |    |   b]   b+1
Real:  [c   |    |    |    |    |   d)
```

Or, in math terms, you're converting not to `[c,d)` but to `[c,d']`.  Substitute in `d'` for `y`, and `b` for `x`, since it's the highest value which can be used as an input.

```
Original:  y = c + (d - c) * (x - a) / (b - a)
With d':  d' = c + (d - c) * (b - a) / (b - a + 1)
```

Intuitively, as that denominator will be just a tiny bit larger, that fraction will be just a tiny bit smaller, yielding `d'` just a tiny bit less than `d`.

Its unwieldy, but this means you are no longer converting `[a..b]` to `[c,d)`, but instead to `[c,c+(d-c)*(b-a)/(b-a+1)]`.
This means you're back to converting between symmetric closed bounds, the same as before.

The same could be done in reverse, for `[a..b]` → `(c,d]`.
Instead of using the padding at the end, "indent" the spare space at the lower bound:

```
    <--|-----|-----|-----|-----|-----|->
Int:   [a    |     |     |     |    b]
+1    a-1   [a   |    |    |    |   b]
Real:  (c   |    |    |    |    |   d]
```

Generalized:

> When converting from Integer to open-lower Real, use the number of discrete integers (`b-a+1`) as the divisor instead of just `b-a`, and indent by `1/` that amount.

The math follows the same pattern, but you want `c'` for `y` and `a` for `x`, as you want the lowest possible value.

```
Original:  y = c + (d - c) * (x - a) / (b - a)
Indent:   c' = c + ((d - c) * (a - a) + 1) / (b - a + 1)
c' = c + ((d - c) * 0 + 1) / (b - a + 1)
c' = c + 1 / (b - a + 1)
```

Thus, you are technically converting `[a..b]` not to the open-lower range of `(c,d]` but to the closed-lower range of `[c+1/(b-a+1),d]`.
You can then follow the known rules for closed range conversions.

Converting `[a..b]` to `(c,d)` would follow the same pattern: add the indent factor, but it is half the indent of a half-open range.
It's easier to see visually:

```
    <--|-----|-----|-----|-----|-----|->
Int:   [a    |     |     |     |    b]
+1    a-1   [a  |   |   |   |  b]   b+1
Real:  (c   |   |   |   |   |   |   d)
```

This has the nice symmetry that `[a..b]` is functionally equivalent to `(a-1..b+1)`, which then matches the boundary openness of `(c,d)`.

Technically, there's no reason the indent _must_ be equivalent to "integer space".
It just makes the math easy to reason about.
This also helps you spot errors: you know you should never see a `c` or `d`, so if you do, you're off by exactly `1` in your math somewhere.

You could also just "shrink" the Real width by some amount acceptable to your floating point capabilities.

## Open-bounded Real to Integer

Could you use that same system for converting `[a,b)` or `(a,b]` or `(a,b)` to `[c..d]`?

You could ... except that the bucketing system only "works" because you're accepting that you're already working with discrete outputs from discrete inputs.
For Int-from-Real conversions, you have infinite inputs and discrete outputs.

This means you (probably) want to accept infinitesimally-close values to `a` and `b`.
Thus, there's no practical "shrink" you can do to your open bounds to allow you to "pretend" they are closed bounds.

Instead, you _could_ just cheat and ignore the open-bounded-ness.
That is, pretend that `[a,b)` and `(a,b]` and `(a,b)` are all just `[a,b]`.
The output values are discrete anyway, so you're already throwing away information.
Whether an input came from `a` or something infinitely close to `a` is irrelevant to the `round()` function after it's all normalized.

Thus, `IntegerRange` ignores the open/closed-ness of bounds when converting from another range.
