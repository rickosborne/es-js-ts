# docs

_Goal:_ I want to be able to:

- Use some variant of [tsdoc](https://tsdoc.org/) comments.
- Generate a README for published packages.

For that last part, I _don't_ need exhaustive API docs.
I assume anyone who uses my code is probably going to use the inline help in their IDE, _not_ some online resource.
Thus, the README only needs to be enough for npmjs to index something sensible.

## Attempt 1: TypeDoc

[typedoc.org](https://typedoc.org/)

_Takeaway:_ Overkill.

I got it working ... but it really, _really_ wants to generate exhaustive docs.
You can get it to generate a single markdown file, but it ends up being a firehose of every little detail.
Customizing that, to just summarize instead of exhaust, is ... not easy.

To be clear: it seems like a solid solution for full API docs.
It's just bad at simple "overview list" outputs.

Also: it's not TypeDoc's fault, but npmjs' behavior for in-markdown links is counter-intuitive, so TypeDoc's desire to act like a static site generator really works against you.

## Attempt 2: api-extractor

[api-extractor.com](https://api-extractor.com/)

_Takeaway:_ Workable.  But it also feels like it's just a matter of time before it is completely unsupported.

This was actually super easy to get up and running.
It took maybe two hours from "look what I found" to "reasonable markdown", and that included me throwing out the default markdown renderer and writing a really basic replacement.

It suffers from the same problem `tsconfig` has — mixing together _what_ to build and _how_ to build it — and is thus annoying for a monorepo.
But it's from the same people, so I can't say I'm surprised.
