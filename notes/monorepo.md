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
- I also know about [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces).
  They don't offer much more than nested `package.json` files, which also work fine without workspaces.
  Meh.

## Status

Eh.  Not amazing.

## Problem: too many `tsconfig` files

I know I need distinct `tsconfig` files for ESM + CJS + types.
That's fine.

~~But there doesn't seem to be a simple way to have a single set of those `tsconfig` files for the root, but then be able to build each module into its own `{module}/dist` directory.
_And_ have `import ... from "@rickosborne/moduleName";` work all over the place.~~

~~The problem seems to come down to some magic combination of `extends`, `baseUrl` and `paths` which I haven't figured out yet.~~

_Update 2024-12-23_

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
			"@rickosborne/foundation": ["foundation"],
			"@rickosborne/guard": ["guard"],
			"@rickosborne/typical": ["typical"]
		}
	}
}
```

The format here is critical.
Some online resources will tell you to use paths like `node_modules/@rickosborne/guard/dist/types` but I couldn't get that to work reliably.

(You could, in theory, use something like `@rickosborne/*` and then just `"./*"`, but I have some packages which are not in this repo, so this is easier for me.)

The second part is with `npm link`.
Before `npm link` can work correctly, make sure each of your module-level `package.json` files has a namespaced `name`.
That is, it should look like `"name": "@rickosborne/guard"` and not just `"name": "guard"`.
It's _probably_ already set up like this if you have publishing working.

Then, in each of your modules, `cd (moduleName)` into the module directory and then `npm link` by itself.
This sets up the module to be consumed elsewhere.

For example:

```shell
cd typical
npm link
# Now @rickosborne/typical can be referenced elsewhere
cd ../guard
npm link
# ... and now @rickosborne/guard can be referenced
```

Once all your modules are ready to be referenced, go back through each of your modules again and link the dependencies.
The part that the npm docs don't mention so well is that if you have multiple dependencies, they all _must_ be linked at once with one command:

```shell
# In each module ...
cd foundation
# DO NOT do this:
#   npm link @rickosborne/typical
#   npm link @rickosborne/guard
# Instead, do this:
npm link @rickosborne/typical @rickosborne/guard
```

You can tell if this worked correctly by going into your module-level `node_modules/@rickosborne` directory.
The entries there should be symlinks, _not_ real directories.
If they are real directories, then they are managed by `npm install` and _not_ `npm link`, and it will end in tears.

Repeat this for each module with dependencies.

When you make a new module, or change dependencies, unfortunately you will need to recreate the full/new list, and not just add/remove.
So, for example, if I added another dependency I'd need to run something like:

```shell
npm link @rickosborne/typical @rickosborne/guard @rickosborne/command
```

Annoying, but manageable.
You could probably even have a script to check these for you so you can't forget.

Also, _do not_ link your modules into the root-level `node_modules`.
This seems to confuse `tsc` a bit.

