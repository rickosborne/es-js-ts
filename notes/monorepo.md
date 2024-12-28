# Monorepo

_Goal:_ I want to be able to:

- Have a single repo (this one)
- Which has multiple modules (like `typical` and `guard`)
- Each of which can be published to its own npm package (like `@rickosborne/guard`)
- Those packages should support CJS+ESM without too many headaches
- They all share some foundational dependencies (like TypeScript v5)
- Each module may extend that with its own module-specific dependencies (like Jimp or canvas)
- They should all share as much configuration as plausible, _preferably_ without having to copy-and-paste

Nice-to-have:

- I should be able to relatively easy chain builds
- Same for test suites

Do-not-wants:

- Yes, I know about [Lerna](https://lerna.js.org/) and [Nx](https://nx.dev/).
  I'd prefer to not add any more tooling than plain old npm.
- ~~I also know about [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces).
  They don't offer much more than nested `package.json` files, which also work fine without workspaces.
  Meh.~~

## Status

Eh.  Not amazing.

## Problem: too many `tsconfig` files

I know I need distinct `tsconfig` files for ESM + CJS + types.
That's fine.

### Update 2024-12-26

Okay, after much, _much_ fiddling, it seems I have found the magic words.
It's basically what is listed below in [Update 2024-12-23](#update-2024-12-23) but with a few extras.

I had originally _not_ wanted to install the modules as dependencies of the top-level `package.json` ... but it turns out this is almost the easiest solution.
Basically, just add something like this to your top-level `package.json`:

```json
{
	"workspaces": [
		"typical",
		"guard",
		"foundation"
	]
}
```

**Do not** add the modules to a top-level `dependencies` map.
Only add the paths / directory names to the `workspaces` list.

The order is important: npm isn't going to try to do any dependency resolution on those module-level `package.json` files to figure out a "correct" order, so you just need to hard-code it.

That little bit of magic makes it so that `npm ci` (or `npm install`, initially) will automagically `npm link` your modules.

In each module, make sure you have an `index.ts` which has an `export` for each published type/var, and then in its `package.json`'s `exports` block you should have _exactly_:

```json
{
	"dependencies": {
		"@rickosborne/guard": "file:../guard",
		"@rickosborne/typical": "file:../typical"
	},
	"exports": {
		".": {
			"default": "./index.ts",
			"types": "./index.ts"
		}
	}
}
```

In that file, ***do not*** include `require` or `import` values.
You don't need them for `tsc`, and they will just confuse things.

When you want to publish a module, you'll need to generate a new module-level `dist/package.json` which takes out the references to `index.ts` files and includes only `.js`, and swaps out the `file:` versions for release values:

```json
{
	"dependencies": {
		"@rickosborne/guard": "2024.12.32",
		"@rickosborne/typical": "2024.12.32"
	},
	"exports": {
		".": {
			"default": "./esm/index.js",
			"import": "./esm/index.js",
			"require": "./cjs/index.js",
			"types": "./types/index.d.ts"
		}
	},
	"main": "cjs/index.js",
	"module": "esm/index.js",
	"types": "types/index.d.ts",
	"typings": "types/index.d.ts"
}
```

With all this in place, tsc seems happy (going through `index.ts` export aggregators) and node seems happy.

_In theory_ if you have a simple enough setup, you could also use [`customConditions`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#customconditions) in the `tsconfig`.
However, the fine print is that you _must_ set `moduleResolution` to `NodeNext` to use it, which means you can't export CJS via `module: "CommonJS"`.

You'll also run into warnings from `api-extractor` about the wrong kind of file being imported.
Basically, because you want tsc to go through the live `index.ts` file instead of the generated `dist/types/index.d.ts`, `api-extractor` doesn't like that.
However, if you disable the warning, it _seems_ to work just fine.
We'll see how long that lasts.

### Update 2024-12-23

I _think_ I have this a little more reasonable now.
It's still a bit more complex than I would like ... but 🤷.

There doesn't seem to be a way to _not_ have per-module `tsconfig` files.
The problem stems from how the file mixes both _how_ to build (like `target`), _what_ to build (like `baseUrl` and `include`), and _where_ to build (like `outDir`).
It isn't helped by the weird and confusing mix of "this path is relative to this specific file" versus "wherever you ran `tsc` from".

To make matters worse, the `--build` option and `--project` options are orthogonal, and the equivalent of `include` (like `*.ts`) doesn't work with either.

So, to explain what I have now, it's broken down into two levels: root-level general configs, and module-level stub configs.

Before that, a warning:
***DO NOT*** add `include` options to _any_ `tsconfig`.
Stick to `exclude`.
The former will just cause errors in the modules:

> File (other-module) is not under 'rootDir' (current-module). 'rootDir' is expected to contain all source files.

### Root-level configs

Visually:

```
┌───────────────────┐  This contains general settings, like all the `strict`
│      (root)       │  stuff. It should have: `target=esnext`, `noEmit=true`,
│   tsconfig.json   │  `moduleResolution=Node`, `module=None`.
└───────────────────┘  See mine for how `paths` should look.
          ▲
          │  ┌───────────────────┐  Root-level CJS.  Should have ONLY:
          │  │      (root)       │  `module=CommonJS`, `noEmit=false`, `target=ES6`.
          ├──│ tsconfig.cjs.json │  Requires: `extends=./tsconfig.json`
          │  └───────────────────┘
          │  ┌───────────────────┐  Root-level ESM.  Should have ONLY:
          │  │      (root)       │  `module=ESNext`, `noEmit=false`, `target=ESNext`.
          ├──│ tsconfig.esm.json │  Requires: `extends=./tsconfig.json`
          │  └───────────────────┘
          │  ┌───────────────────┐  Root-level TS .d.  Should have ONLY:
          │  │      (root)       │  `declaration=true`, `noEmit=false`,
          └──│tsconfig.types.json│  `emitDeclarationOnly=false`.
             └───────────────────┘  Requires: `extends=./tsconfig.json`
```

An example root-level ESM config:

```json
{
	"compilerOptions": {
		"module": "ESNext",
		"noEmit": false,
		"outDir": "dist/esm",
		"target": "ESNext"
	},
	"exclude": [
		"**/dist/**",
		"**/node_modules/**",
		"**/.cache/**",
		"**/.idea/**",
		"**/.nyc_output/**",
		"**/coverage/**",
		"**/*.test.ts"
	],
	"extends": "./tsconfig.json",
	"ts-node": {
		"esm": true
	}
}
```

The `exclude` stuff here is so any generated JS won't include code for dependencies, tests, etc.
All that ends up in your `dist` is your own code.
They can also speed up `tsc`'s search for files, so you can add directories here even if they don't have any code, like `coverage` above.

## Module-level configs

Each module gets a set of stub configs which basically only override the `baseUrl` (to `"."`), the `rootDir` (also to `"."`), and the `outDir`.  That last one is set to the exact same value as in the root (like `"dist/cjs"`) but setting it in the module-level file makes it relative to that file, instead of to the root.

Each of these extends their root-level counterpart.

For example:

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"outDir": "dist/cjs",
		"rootDir": "."
	},
	"extends": "../tsconfig.cjs.json"
}
```

Visually, this extends the previous chart to:

```
┌───────────────────┐                       ┌───────────────────┐
│      (root)       │                       │     (module)      │
│   tsconfig.json   │◀──────────────────────│   tsconfig.json   │ These module-level
└───────────────────┘                       └───────────────────┘ configs should
          ▲  ┌───────────────────┐          ┌───────────────────┐ only set:
          │  │      (root)       │          │     (module)      │
          ├──│ tsconfig.cjs.json │◀─────────│ tsconfig.cjs.json │ baseUrl=.
          │  └───────────────────┘          └───────────────────┘ outDir=dist/(type)
          │  ┌───────────────────┐          ┌───────────────────┐ rootDir=.
          │  │      (root)       │          │     (module)      │
          ├──│ tsconfig.esm.json │◀─────────│ tsconfig.esm.json │ Each extends its
          │  └───────────────────┘          └───────────────────┘ root-level
          │  ┌───────────────────┐          ┌───────────────────┐ counterpart.
          │  │      (root)       │          │     (module)      │
          └──│tsconfig.types.json│◀─────────│tsconfig.types.json│
             └───────────────────┘          └───────────────────┘
```

## Paths and links

Obviously, you're going to want to get namespaces and paths set up.
That is, you want to be able to do:

```typescript
import { Comparator } from "@rickosborne/typical";
```

That needs to work anywhere in the repo, just like it would for anyone who uses your published package.

Set up `paths` and `baseUrl` in your root-level `tsconfig.json`, like:

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"moduleResolution": "Node",
		"paths": {
			"@rickosborne/foundation": [
				"foundation/ts/index.ts"
			],
			"@rickosborne/guard": [
				"guard/ts/index.ts"
			],
			"@rickosborne/typical": [
				"typical/ts/index.ts"
			]
		}
	}
}
```

The format here is critical.
Some online resources will tell you to use paths like `node_modules/@rickosborne/guard/dist/types` but I couldn't get that to work reliably.

(You could, in theory, use something like `@rickosborne/*` and then just `"./*"`, but I have some packages which are not in this repo, so this is easier for me.)
