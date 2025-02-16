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
