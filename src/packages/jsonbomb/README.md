# @rickosborne/jsonbomb

A TypeScript port of [jwz's jsonbomb.pl](https://www.jwz.org/hacks/jsonbomb.pl) script.

The original script includes the following description:

> Creates an absolutely enormous, but syntactically correct, JSON file,
> suitable for use as a zipbomb.
>
> It attempts to stay below various length and depth limitations, with my
> best guesses as to what typical parsers' limits are; the goal here being
> to consume as much of the parser's time and memory as possible before it
> has an excuse to give up early.
>
> With a 10GB file, `jq` parses the entire file and produces no error
> messages, but also no output, and takes nearly 60 seconds to do so
> (Mac Studio M1 Ultra, 2026).
>
> `"jsonbomb.pl --max-size 10GB | gzip --best"` yields a 705MB file.
> With `--no-permute-strings`, it is a more reasonable 61MB.
>
> See https://www.jwz.org/blog/2026/01/zipbomb-json/
> and https://www.jwz.org/blog/2024/02/harassing-botnets-with-zipbombs/
>
> Created:  1-Feb-2026.

## License

The original script's copyright notice:

> Copyright © 2026 Jamie Zawinski &lt;jwz@jwz.org&gt;

This port is licensed under the same terms as jwz's script:

> Permission to use, copy, modify, distribute, and sell this software and its
> documentation for any purpose is hereby granted without fee, provided that
> the above copyright notice appear in all copies and that both that
> copyright notice and this permission notice appear in supporting
> documentation.  No representations are made about the suitability of this
> software for any purpose.  It is provided "as is" without express or
> implied warranty.

Note that this is an exception to my usual preference for CC-BY-NC-SA, and applies only to this specific package.
