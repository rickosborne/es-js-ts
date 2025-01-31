# RGB Conversion

What are the various number ranges for RGB component values?

- `[0..255]` — Integers.  Common in CSS, and history in general, because it fit into an unsigned byte.
- `[0,1]` — Reals.  Common in [OpenGL](https://www.khronos.org/opengl/wiki/Image_Format).

This pairing presents an interesting conundrum in two parts:

- If you want to store a "high-res" value, to minimize precision loss through rounding errors, what's a good format?
- How do you scale between the two?

Let's say you ignored the first question, and just scaled `[0..255] <=> [0,1]` directly.

If you used the [Rebound](../../rebound/README.md) library, it might look like:

```typescript
const int255From01 = (value: Real01 | undefined) => int255.range.scaleValueFrom(value, real01.range) as Int255;
```

Under the hood, this follows the logic in [Range Scaling](../../rebound/doc/range-scaling.md).
In practice, this turns out to be:

```typescript
const red255 = Math.round(red01 * 255);
```

Does this make sense, though?

When rounding, an output of `0` requires an the product of `red01*255` be in the range `[0,0.5)` so it can get rounded down.
If we divide up that `0.5` by `255`, we'd see that input values for `red01` in the range `[0,0.00196)` will yield an output `red255` of `0`.

But ... if we divided up the range `[0,1]` into `256` equal values, we'd get `1/256=0.00390625`.
Which means an output of `0` gets barely half its "fair" share.
The same would be true of an output of `255`.

Maybe it makes more sense to do something like the following:

```typescript
const red255 = Math.min(255, Math.trunc(red01 * 256));
```

By using `trunc` instead of `round`, an output of `0` gets its full input range of `[0,0.00390625)` alongside the other numbers.
There is an infinitesimal bias for an output of `255`, as it has a closed upper bound instead of an open one.
But meh?
