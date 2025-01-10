/**
 * @typedef SemVer
 * @type {object}
 * @property {string} major
 * @property {string} minor
 */

/**
 * @typedef Plan
 * @type {object}
 * @property {string} currentVersion            Current version declaration (may be a range).
 * @property {SemVer[]} currentVersionSemver    Current version declaration in semantic versioning format (may be a range).
 * @property {string} upgradedVersion           Upgraded version.
 * @property {SemVer} upgradedVersionSemver     Upgraded version in semantic versioning format.
 */

const holdBack = {
	"@types/chai": 4,
	"@eslint/js": 8,
	"@stylistic/eslint-plugin-js": 1,
	"@typescript-eslint/eslint-plugin": 6,
	"@typescript-eslint/parser": 6,
	chai: 4,
	eslint: 8,
};

/** Filter out non-major version updates.
 * @param {string} name        The name of the dependency.
 * @param {Plan} plan
 * @returns {boolean}                 Return true if the upgrade should be kept, otherwise it will be ignored.
 */
function filterResults(name, plan) {
	const maybeMajor = holdBack[name];
	if (maybeMajor != null) {
		return parseInt(plan.upgradedVersionSemver.major) <= maybeMajor;
	}
	return true;
}

// noinspection JSUnusedGlobalSymbols
module.exports = { filterResults };
