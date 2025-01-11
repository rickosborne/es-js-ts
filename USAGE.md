## Usage

Install via your favorite package manager.

Each package supports CommonJS `require`, ESM `import`, and TypeScript usage.

You also have a choice: barrel imports or direct imports.

Barrel imports mean you're going to require/import everything from the same package-level namespace:

```typescript
// CommonJS
const { isPlainObject, isListOf } = require("@rickosborne/guard");
// ESM / TypeScript
import { isPlainObject, isListOf } from "@rickosborne/guard";
```

Implications:

- Nice and simple.
- Your build system needs to do tree-shaking well ... or you'll end up adding the entire package even if you only import two functions.

The other option is to use direct imports:

```typescript
// CommonJS
const { isPlainObject } = require("@rickosborne/guard/is-object");
const { isListOf } = require("@rickosborne/guard/is-list-of");
// ESM / TypeScript
import { isPlainObject } from "@rickosborne/guard/is-object.js";
import { isListOf } from "@rickosborne/guard/is-list-of.js";
```

Implications:

- You (probably) don't have to worry about tree-shaking as your build (likely) ends up with only the functions you need.

If you're using a modern build system, there aren't any strong reasons to prefer one way over the other.
It's really just down to your personal preference.

### A quick note about file extensions

Do you need to use file extensions?
And if so, which extensions?

Honestly ... this is a dumpster fire question.
It really comes down to your own setup and configuration.

Within each package itself:

- The CommonJS files all have `.cjs` extensions.
- The ESM files all have `.mjs` extensions.
- Node subpath exports have been set up to send `.js` imports to the `.cjs` (via `require`) or `.mjs` (via `import`) files, depending on your setup.

So, in theory, the only extension which _won't_ work would be `.ts` because the source isn't included.

If you run into a problem with a particular configuration, file a GitHub issue with:

- Your `tsconfig.json`'s `module`, `moduleResolution`, and `target` settings.
- Your `package.json`'s `type` and `imports` settings.
- An example of another package which imports correctly for you.
