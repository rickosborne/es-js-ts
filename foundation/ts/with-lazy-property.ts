import type { WithProperty } from "@rickosborne/typical";

/**
 * Add a property to the given object which is calculated lazily, and
 * only once.
 */
export const withLazyProperty = <Target, Property, Name extends string>(
	target: Target,
	name: Name,
	calculator: (t: Target) => Property,
): WithProperty<Target, Name, Property> => {
	Object.defineProperty(target, name, {
		configurable: true,
		enumerable: true,
		get(): Property {
			const value = calculator(target);
			delete (target as { [K in Name]: Property })[ name ];
			Object.defineProperty(target, name, {
				configurable: false,
				enumerable: true,
				value,
			});
			return value;
		},
	});
	return target as WithProperty<Target, Name, Property>;
};
