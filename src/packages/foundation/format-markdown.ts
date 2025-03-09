/**
 * Options for {@link formatMarkdownTable}.
 */
export interface FormatMarkdownTableOptions<T extends object> {
	/**
	 * Override the names shown in the column headers, replacing the object keys.
	 */
	columnNames?: Record<keyof T, string> | ((key: keyof T) => string);
	/**
	 * Provide a specific order for the columns, instead of relying on lexical sorting.
	 */
	columnOrder?: (keyof T)[] | ((key: keyof T) => number);
	/**
	 * Custom string-from-value converter.
	 */
	stringify?: (value: unknown, key: keyof T) => string | undefined;
}

/**
 * Generate a Markdown-formatted table for the given items.
 */
export const formatMarkdownTable = <T extends object>(
	values: T[],
	options: FormatMarkdownTableOptions<T>,
): string => {
	const stringify = options.stringify ?? ((s) => s == null ? undefined : String(s));
	const keySet = new Set<keyof T>();
	const widths = {} as Record<keyof T, number>;
	const texts: Record<keyof T, string | undefined>[] = [];
	for (const value of values) {
		const formatted = {} as Record<keyof T, string | undefined>;
		for (const key of Object.keys(value) as (keyof T)[]) {
			keySet.add(key);
			const text = stringify(value[key] as unknown, key);
			formatted[key] = text;
			if (text != null) {
				widths[key] = Math.max(widths[key] ?? 0, text.length);
			}
		}
		texts.push(formatted);
	}
	let sortedKeys: (keyof T)[] = Array.from(keySet);
	const colOrder = options.columnOrder;
	if (typeof colOrder === "function") {
		sortedKeys.sort((a, b) => colOrder(a) - colOrder(b));
	} else if (Array.isArray(colOrder)) {
		sortedKeys = colOrder;
	} else {
		sortedKeys.sort();
	}
	let colNameOf: (key: keyof T) => string;
	if (typeof options.columnNames === "function") {
		colNameOf = options.columnNames;
	} else if (options.columnNames != null) {
		const colNames = options.columnNames;
		colNameOf = (key) => colNames[key] ?? key;
	} else {
		colNameOf = (key) => String(key);
	}
	const presentKeys = sortedKeys
		.filter((k) => (widths[k] ?? 0) > 0);
	const headerValues = Object.fromEntries(presentKeys.map((key) => {
		const name = colNameOf(key);
		widths[key] = Math.max(widths[key] ?? 0, name.length);
		return [ key, name ];
	})) as Record<keyof T, string>;
	const lineValues = Object.fromEntries(presentKeys.map((key) => [ key, "-".repeat(widths[key]) ])) as Record<keyof T, string>;
	const formatValue = (value: Record<keyof T, string | undefined>): string => {
		let parts: string[] = [ "|" ];
		for (const key of presentKeys) {
			const width: number = widths[key] ?? 0;
			let text: string = value[key] ?? "";
			if (text.length < width) {
				text = text.concat(" ".repeat(width - text.length));
			}
			parts.push(text, "|");
		}
		return parts.join(" ");
	};
	const lines = texts.map((t) => formatValue(t));
	lines.unshift(formatValue(lineValues));
	lines.unshift(formatValue(headerValues));
	return lines.join("\n").concat("\n");
};
