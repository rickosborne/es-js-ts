# Rick Osborne's JS/ES/TS Tools

This monorepo contains some of my Javascript/EcmaScript/TypeScript modules.
Individual packages are published under [@rickosborne/*](https://www.npmjs.com/~rickosborne) on npm.

* [@rickosborne/typical](https://www.npmjs.com/package/@rickosborne/typical) — Useful type helpers and type declarations.
* [@rickosborne/guard](https://www.npmjs.com/package/@rickosborne/guard) — Type guards for some of those types.
* [@rickosborne/foundation](https://www.npmjs.com/package/@rickosborne/foundation) — Basic data structures and algorithms, like priority queues, binary searches, and sorting.
* [@rickosborne/css](https://www.npmjs.com/package/@rickosborne/css) — Tools for working with CSS, such as CSS Color parsers and formatters.
* [@rickosborne/hue](https://www.npmjs.com/package/@rickosborne/hue) — General color-handling tools for RGB, HSV, and HSL/HWB.
* [@rickosborne/planar](https://www.npmjs.com/package/@rickosborne/planar) — 2D Cartesian and graphics related data structures and algorithms, like polygon convex testing, line segment intersections, etc.
* [@rickosborne/term](https://www.npmjs.com/package/@rickosborne/term) — Utilities for working at the terminal/console/command-line, with local files and processes, etc.
* [@rickosborne/skip](./src/packages/skip/README.md) — (In progress.)  Work with [States Language](https://states-language.net/#map-state-failure-tolerance) state machines and AWS Step Functions.
  Includes a rudimentary, but functional and tested, local States Language runner, so you can unit test and integration test your Step Functions without having to publish to the cloud.

## Notes

* [monorepo](./notes/monorepo.md) — How I have TypeScript + multiple modules/packages set up here.
* [docs](./notes/docs.md) — How I generate package README files formatted for npmjs.com.

## License

All content here is licensed as [CC-BY-NC-SA-4.0] unless otherwise noted.
That is, Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.

[CC-BY-NC-SA-4.0]: https://creativecommons.org/licenses/by-nc-sa/4.0/
