/**
 * Test for whether two numbers are close enough to each other,
 * within an acceptable margin.
 */
export const closeTo = (
	a: number,
	b: number,
	epsilon: number = 0.00001,
): boolean => {
	const delta = Math.abs(a - b);
	return delta <= epsilon;
};

/**
 * Test for whether a number is close enough to zero, within an
 * acceptable margin.
 */
export const closeToZero = (
	n: number,
	epsilon: number = 0.00001,
): n is 0 => {
	return closeTo(n, 0, epsilon);
};
