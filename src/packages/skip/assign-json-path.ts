import { hasOwn, hasString, isJSONObject } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import * as jsonpath from "jsonpath";
import { STATES_RESULT_PATH_MATCH_FAILURE } from "./sfn-types.js";
import { StatesError } from "./states-error.js";

interface RootExpression {
	type: "root";
}

const isRootExpression = (value: unknown): value is RootExpression => hasString(value, "type") && value.type === "root";

interface IdentifierExpression {
	type: "identifier";
	value: string;
}

interface NumericLiteralExpression {
	type: "numeric_literal";
	value: number;
}

interface StringLiteralExpression {
	type: "string_literal";
	value: number;
}

type JSONPathExpression = RootExpression | IdentifierExpression | NumericLiteralExpression | StringLiteralExpression;

// const isJSONPathExpression = (value: unknown): value is JSONPathExpression => hasString(value, "type");

interface JSONPathNode {
	expression: JSONPathExpression;
}

// eslint-disable-next-line no-shadow
interface ChildNode extends JSONPathNode {
	operation: string;
	scope: "child";
}

interface SubscriptNode extends ChildNode {
	expression: NumericLiteralExpression | StringLiteralExpression;
	operation: "subscript";
}

interface MemberNode extends ChildNode {
	expression: IdentifierExpression;
	operation: "member";
}

const isJSONPathNode = (value: unknown): value is JSONPathNode => hasOwn(value, "expression", isJSONObject);
const isChildNode = (value: unknown): value is ChildNode => isJSONPathNode(value) && hasString(value, "scope") && value.scope === "child";
const isSubscriptNode = (value: unknown): value is SubscriptNode => isChildNode(value) && value.operation === "subscript";
const isMemberNode = (value: unknown): value is MemberNode => isChildNode(value) && value.operation === "member";

export interface JSONPathErrorOptions extends ErrorOptions {
	message?: string;
}

/**
 * Thrown when there's a problem trying to resolve or assign using a
 * JSONPath expression.  This implementation is super-duper basic,
 * so it's not going to support anything beyond dotted-path expressions.
 */
export class JSONPathError extends StatesError {
	public readonly expression: string;

	public constructor(expression: string, options: JSONPathErrorOptions = {}) {
		const message = options.message ?? `Error in JSONPath expression: ${ expression }`;
		super(STATES_RESULT_PATH_MATCH_FAILURE, message, options);
		this.expression = expression;
	}
}

/**
 * Given a target object, a JSONPath expression for navigating that
 * object, and a value, try to traverse the object and assign the
 * value at the given path.  Will create "container" records and
 * arrays to make the path work, if necessary.  Does not support
 * anything particularly tricky.
 */
export const assignJSONPath = (target: JSONSerializable, jsonPathExpression: string, value: JSONSerializable): void => {
	let replacedAny = false;
	jsonpath.apply(target, jsonPathExpression, () => {
		replacedAny = true;
		return value;
	});
	if (replacedAny) return;
	const components = jsonpath.parse(jsonPathExpression);
	let current: JSONSerializable = target;
	const fail = (message: string) => {
		return new JSONPathError(jsonPathExpression, { message });
	};
	const nextContainer = (): JSONSerializable => {
		if (components.length === 0) {
			return value;
		}
		const nextComponent: unknown = components[ 0 ];
		if (isMemberNode(nextComponent)) {
			return {};
		}
		if (isSubscriptNode(nextComponent)) {
			if (nextComponent.expression.type === "string_literal") {
				return {};
			}
			if (nextComponent.expression.type === "numeric_literal") {
				return [];
			}
			throw fail(`Unknown subscript type: ${ JSON.stringify(nextComponent.expression) }`);
		}
		throw fail(`Unknown container expected: ${ JSON.stringify(nextComponent) }`);
	};
	while (components.length > 0) {
		const component: unknown = components.shift();
		if (typeof component !== "object" || Array.isArray(component)) {
			throw fail("Expected an object JSONPath component");
		}
		if (current == null) {
			throw fail("Lost track of current");
		}
		if (isRootExpression(component)) continue;
		if (!isJSONPathNode(component)) {
			throw fail("Unknown JSONPath node type");
		}
		const expression = component.expression;
		if (isRootExpression(expression)) continue;
		if (isChildNode(component)) {
			if (expression.type === "identifier" || expression.type === "string_literal") {
				const id = expression.value;
				if (isJSONObject(current)) {
					if (components.length === 0) {
						current[ id ] = value;
						return;
					}
					if (!Object.hasOwn(current, id)) {
						current[ id ] = nextContainer();
					}
					current = current[ id ]!;
					continue;
				}
				throw fail(`Unknown JSONPath expression: ${ JSON.stringify(expression) }`);
			}
			if (expression.type === "numeric_literal") {
				const index = expression.value;
				if (Array.isArray(current)) {
					if (components.length === 0) {
						current[ index ] = value;
						return;
					}
					const existing = current[ index ];
					if (existing == null || typeof existing !== "object") {
						current[ index ] = nextContainer();
					}
					current = current[ index ]!;
					continue;
				}
			}
			throw fail(`Unknown child type: ${ expression.type }`);
		}
		if (hasString(component, "scope") && component.scope === "child" && expression?.type === "identifier" && hasString(expression, "value")) {
		}
	}
};
