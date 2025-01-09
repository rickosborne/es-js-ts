import { comparatorBuilder } from "@rickosborne/foundation";

export const regExpComparator = comparatorBuilder<RegExp>()
	.str((re) => re.source)
	.str((re) => re.flags)
	.build();
