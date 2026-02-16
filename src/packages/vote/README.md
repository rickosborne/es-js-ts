# @rickosborne/vote

A collection of utilities for voting systems.
These are not intended to be production-grade, but illustrative.

## Voting Systems

This library contains code for the following voting systems:

- [Approval](https://en.wikipedia.org/wiki/Approval_voting)
- [Combined Approval](https://en.wikipedia.org/wiki/Combined_approval_voting)
- [Cumulative](https://en.wikipedia.org/wiki/Cumulative_voting)
- [First Past the Post / Plurality](https://en.wikipedia.org/wiki/First-past-the-post_voting)
- [Quadratic](https://en.wikipedia.org/wiki/Quadratic_voting)
- [Ranked-Choice / Instant-Run-Off](https://en.wikipedia.org/wiki/Instant-runoff_voting)
- [STAR](https://en.wikipedia.org/wiki/STAR_voting)

The code for these systems has not been optimized — it is intended to be readable for learning.
As such, the systems are implemented with defaults, such as a `[0...5]` scale for STAR, which would likely need to be extracted into configuration controls for any variations on the base algorithm.

## Ballot Validity

None of the algorithm implementations here do any checks for the validity of ballots.
As each algorithm accepts an accessor function to convert a ballot into its votes, any caller should implement any ballot validation in or before that function.

For example, these algorithms would not try to ensure a ranked choice ballot did not have the same candidate listed twice.
Nor would they ensure only the maximum number of candidate choice slots was used.

Ensure your ballots are clean and valid before calling any of these functions.

## Ranks and Ties

All voting algorithms may produce ties, and they must be considered in any voting system.

All `rank` values returned by these implementations will be in the range `[1...N]`, where `N` is the number of candidates.
For ties, the **maximum** rank of all the ties returned.

For example, if you have a tie for first place, both winners will have `rank = 2`, **not** `1`.

Similarly, if you have one winner (`rank = 1`) and two ties after that, the tied candidates will have `rank = 3`, **not** 2.

This behavior should not be considered a normative part of any specific voting system — it is only a convention chosen by this library for consistency.
