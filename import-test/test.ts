import { intRange } from "@rickosborne/foundation";
import { isUnaryPredicate } from "@rickosborne/guard";
import { Comparator, Predicate } from "@rickosborne/typical";

const predicate: Predicate<string> = (text: string) => text.length > 3;

if (!isUnaryPredicate(predicate)) {
	throw new Error("Not a unary predicate?");
}

const odds = intRange.from(1).by(2).toExclusive(6).toArray();

if (odds[ 0 ] != 1 || odds[ 1 ] !== 3 || odds[ 2 ] !== 5) {
	throw new Error("Odds are ... odd");
}

const comparator: Comparator<number> = (a, b) => a - b;
if (comparator(odds[ 0 ], odds[ 1 ]) >= 0) {
	throw new Error("Comparator is busted");
}
