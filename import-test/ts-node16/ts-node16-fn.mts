import { comparatorBuilder } from "@rickosborne/foundation";
import { assertDefined } from "@rickosborne/guard";

export const regExpComparator = comparatorBuilder<RegExp>()
	.str((re) => re.source)
	.str((re) => re.flags)
	.build();

assertDefined(123, "123");
