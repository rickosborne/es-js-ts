export function lowerFirst(text: string): string;
export function lowerFirst(text: string | null | undefined): string | undefined;
export function lowerFirst(text: string | null | undefined): string | undefined {
	if (text == null) {
		return undefined;
	}
	return text.substring(0, 1).toLocaleLowerCase().concat(text.substring(1));
}
