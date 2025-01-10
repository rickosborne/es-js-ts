/**
 * Possible delimiters between a date and a time value.
 */
export const TIME_DELIMITERS = [ "T", " ", " ", "@" ];

/**
 * Configuration for a {@link parseLocalDate} call.
 */
export type ParseLocalDateConfig = {
	/**
	 * If a timezone offset is not specified in the text, explicitly
	 * add this offset before returning.  You probably don't want this
	 * unless you have a very specific reason.
	 */
	offsetMinutes?: number;
	/**
	 * Allow time information to be specified.
	 * @defaultValue false
	 */
	time?: boolean;
	/**
	 * Allowable delimiters between the date part and time part.
	 * @defaultValue {@link TIME_DELIMITERS}
	 */
	timeDelimiters?: string[];
	/**
	 * Allow timezone information to be specified.
	 * @defaultValue false
	 */
	zone?: boolean;
}

/**
 * Parse an ISO-8860-like date, but do so assuming that the time is intended
 * to be local, not UTC.  But if allowed, the date could override this with
 * specific time zone info.
 * @remarks
 * Why bother with this?  Why not just use <kbd>Date.parse()</kbd>? JS
 * dates are tricky with how they are sometimes based on UTC, and sometimes
 * on local times, and that all depends on the string which is provided.
 * I, personally, find this constantly violates my Principle of Least
 * Surprise.
 */
export const parseLocalDate = (text: string, config: ParseLocalDateConfig = {}): Date => {
	let remain = text;
	const dateMatch = /^(\d{4})-?(0\d|1[012])-?([012]\d|3[01])/.exec(remain);
	if (dateMatch == null) {
		throw new RangeError("Date expected");
	}
	const [ datePart, yearText, monthText, dayText ] = dateMatch;
	remain = remain.substring(datePart.length);
	const year = parseInt(yearText!, 10);
	const month = parseInt(monthText!, 10);
	const day = parseInt(dayText!, 10);
	let utc = false;
	let hour = 0;
	let min = 0;
	let sec = 0;
	let ms = 0;
	let offsetMs = config.offsetMinutes == null ? 0 : (config.offsetMinutes * 60_000);
	if (config.time === true) {
		const timeDelimiters = config.timeDelimiters ?? TIME_DELIMITERS;
		timeDelimiters.forEach((del) => {
			if (remain.startsWith(del)) {
				remain = remain.substring(del.length);
			}
		});
		const timeMatch = /^([01]\d|2[0-4]):?([0-5]\d|6[01])(?::?([0-5]\d|6[01])(?:\.?(\d+))?)?/.exec(remain);
		if (timeMatch != null) {
			const [ timePart, hourText, minText, secText, msText ] = timeMatch;
			hour = parseInt(hourText!, 10);
			min = parseInt(minText!, 10);
			sec = secText == null || secText === "" ? 0 : parseInt(secText, 10);
			ms = msText == null || msText === "" ? 0 : parseFloat("0.".concat(msText)) * 1000;
			remain = remain.substring(timePart.length);
		}
	}
	if (config.zone === true) {
		if (remain.startsWith("Z")) {
			utc = true;
			remain = remain.substring(1);
		} else {
			const zoneMatch = /^([-+])(\d\d)(?::?(\d\d))?/.exec(remain);
			if (zoneMatch != null) {
				utc = true;
				const [ zonePart, sign, hourText, minText ] = zoneMatch;
				const offHour = parseInt(hourText!, 10);
				const offMin = minText == null || minText === "" ? 0 : parseInt(minText, 10);
				let offsetMin = (offHour * 60) + offMin;
				if (sign === "-") {
					offsetMin = -offsetMin;
				}
				remain = remain.substring(zonePart.length);
				offsetMs = offsetMin * 60_000;
			}
		}
	}
	if (remain !== "") {
		throw new RangeError(`Date expected: ${ JSON.stringify(remain) }`);
	}
	let date: Date;
	if (utc) {
		date = new Date(Date.UTC(year, month - 1, day, hour, min, sec, ms));
	} else {
		date = new Date(year, month - 1, day, hour, min, sec, ms);
	}
	if (offsetMs !== 0) {
		date = new Date(date.valueOf() - offsetMs);
	}
	return date;
};
