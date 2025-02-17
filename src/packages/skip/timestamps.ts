import type { IsoDateTime, SimpleIsoDate, SimpleIsoTime, SimpleIsoTimeZone } from "./sfn-types.js";

/**
 * Guard for whether the value is an ISO8601-formatted timezone.
 */
export const isIsoTimeZone = (value: unknown): value is SimpleIsoTimeZone => {
	if (typeof value !== "string") return false;
	if (value === "Z") return true;
	if (!value.startsWith("+") && !value.startsWith("-")) return false;
	const hhmm = value.substring(1);
	const [ zh, zm, extraZ ] = hhmm.split(":", 3);
	if (extraZ != null || zh == null) return false;
	const h = Number.parseInt(zh, 10);
	if (h < 0 || h > 23) return false;
	if (zm != null) {
		if (!isIntString(zm)) return false;
		const m = Number.parseInt(zm, 10);
		if (m < 0 || m > 59) return false;
	}
	return true;
};

/**
 * Guard for whether the value is a stringified integer.
 */
export const isIntString = (value: unknown): value is `${ number }` => {
	if (typeof value !== "string") return false;
	return value.length > 0 && Array.from(value).every((c) => c.localeCompare("0") >= 0 && c.localeCompare("9") <= 0);
};

/**
 * Guard for whether the value is an ISO8601-formatted date.
 */
export const isIsoDate = (value: unknown): value is SimpleIsoDate => {
	if (typeof value !== "string") return false;
	const [ y, m, d, extraHyphen ] = value.split("-");
	if (extraHyphen != null || y == null || m == null || d == null) return false;
	if (!isIntString(y) || !isIntString(m) || !isIntString(d)) return false;
	const month = Number.parseInt(m, 10);
	if (month < 1 || month > 12) return false;
	const day = Number.parseInt(d, 10);
	if (day < 1 || day > 31) return false;
	if (((month === 9) || (month === 4) || (month === 6) || (month === 11)) && day > 30) return false;
	if (month !== 2 || day !== 29) return true;
	const year = Number.parseInt(y, 10);
	if ((year % 400) === 0) return true;
	if ((year % 100) === 0) return false;
	return (year % 4) === 0;
};

/**
 * Guard for whether the value is an ISO8601-formatted time.
 */
export const isIsoTime = (value: unknown): value is SimpleIsoTime => {
	if (typeof value !== "string") return false;
	const [ h, m, s, extra ] = value.split(":", 4);
	if (extra != null || h == null || m == null || s == null) return false;
	if (!isIntString(h) || !isIntString(m)) return false;
	const hh = Number.parseInt(h, 10);
	if (hh < 0 || hh > 23) return false;
	const mm = Number.parseInt(m, 10);
	if (mm < 0 || mm > 59) return false;
	const [ ss, ms, extraS ] = s.split(".", 3);
	if (ss == null || extraS != null || !isIntString(ss)) return false;
	const sss = Number.parseInt(ss, 10);
	if (sss < 0 || sss > 60) return false;
	if (ms != null) {
		if (!isIntString(ms)) return false;
	}
	return true;
};

/**
 * Guard for whether the value is an ISO8601-formatted date or datetime (timestamp).
 */
export const isIsoDateTime = (value: unknown): value is IsoDateTime => {
	if (typeof value !== "string") return false;
	const [ date, time, extraT ] = value.split("T", 3);
	if (extraT != null || date == null) return false;
	if (!isIsoDate(date)) return false;
	if (time == null) return true;
	let t = time;
	let zoneSep: string | undefined;
	if (t.endsWith("Z")) {
		t = t.substring(0, t.length - 1);
	} else if (t.includes("+")) {
		zoneSep = "+";
	} else if (t.includes("-")) {
		zoneSep = "-";
	}
	if (zoneSep != null) {
		const parts = t.split(zoneSep, 3);
		if (parts.length !== 2) return false;
		t = parts[ 0 ]!;
		const zone = parts[ 1 ]!;
		if (zone === "Z" || !isIsoTimeZone(zoneSep.concat(zone))) return false;
	}
	return isIsoTime(t);
};
