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

/** Filter out non-major version updates.
  * @param {string} name        The name of the dependency.
  * @param {Plan} plan
  * @returns {boolean}                 Return true if the upgrade should be kept, otherwise it will be ignored.
 */
function filterResults(name, plan) {
	// noinspection RedundantIfStatementJS
	if ((name === "chai") && parseInt(plan.upgradedVersionSemver.major) > 4) {
		return false;
	}
	return true;
}

// noinspection JSUnusedGlobalSymbols
module.exports = { filterResults };
