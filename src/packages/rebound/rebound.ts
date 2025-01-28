import { computeIfAbsent, lowerFirst } from "@rickosborne/foundation";
import { scrubStackTrace } from "@rickosborne/guard";
import type { AnyFunction } from "@rickosborne/typical";
import { assertForBounds } from "./assert-bounded.js";
import type { AssertExact, AssertIfPresent } from "./assert-bounded.js";
import { fromNumberForBounds } from "./from-number-bounded.js";
import type { FromNumber, FromNumberIfPresent } from "./from-number-bounded.js";
import { guardForBounds } from "./guard-bounded.js";
import type { GuardExact, GuardIfPresent, If } from "./guard-bounded.js";
import type { ConvertTo, IntStrategy } from "./integer-from.js";
import { CEIL, FLOOR, integerFrom, ROUND, TRUNC } from "./integer-from.js";
import type { IntegerGeneratorOptions } from "./integer-generator.js";
import { integerGenerator } from "./integer-generator.js";
import type { NumberRange } from "./number-range.js";
import { randomBounded } from "./random-bounded.js";
import type { RandomBounded } from "./random-bounded.js";
import type { ReboundConfigBuilder } from "./rebound-builder.js";
import { ReboundBuilder } from "./rebound-builder.js";
import { BOUNDS } from "./spec.js";
import type { BoundedNumber, BoundsConfig, LowerInEx, NumberSet, OutOfBoundsErrorProvider, TypedCheckedBounds, UpperInEx } from "./spec.js";
import { ifIfPresent } from "./util.js";

export interface ReboundAllowUndef {
	ifPresent: true;
}

export interface ReboundFnOptions {
	errorProvider?: OutOfBoundsErrorProvider;
	fnName?: string;
	ifPresent?: boolean;
}

export interface ResolvedFnOptions extends Required<ReboundFnOptions> {
	defaultName: string;
}

export interface ReboundRandomOptions {
	fnName?: string;
	rng?: ({ float01(): number; range(low: number, high: number): number });
}

export interface ReboundToIntOptions extends ReboundFnOptions {
	strategy?: IntStrategy;
}

export interface ResolvedToIntOptions extends Required<ReboundToIntOptions> {
	defaultName: string;
}

export class Rebound<N extends number> implements TypedCheckedBounds {
	public static buildType(typeName: string): ReboundConfigBuilder<LowerInEx, number, NumberSet, number, UpperInEx> {
		return new ReboundBuilder(
			{} as BoundsConfig<LowerInEx, number, NumberSet, number, UpperInEx>,
			<Config extends BoundsConfig<LowerInEx, number, NumberSet, number, UpperInEx>>(
				_config: Config,
				range: NumberRange,
			) => new Rebound<BoundedNumber<Config>>(typeName, range));
	}

	private readonly fnCache = new Map<string, AnyFunction>();
	public readonly isInt: boolean;
	public readonly isLowerInc: boolean;
	public readonly isUpperInc: boolean;
	public readonly label: string;
	public readonly lower: number;
	public readonly numberType: N = NaN as N;
	public readonly outOfBoundsErrorProvider: OutOfBoundsErrorProvider;
	public readonly range: NumberRange;
	public readonly typeName: string;
	public readonly upper: number;

	protected constructor(
		typeName: string,
		range: NumberRange,
	) {
		this.range = range;
		this.typeName = typeName;
		this.isInt = range.isInt;
		this.isUpperInc = range.isUpperInc;
		this.isLowerInc = range.isLowerInc;
		this.lower = range.lower;
		this.upper = range.upper;
		this.label = range.label;
		this.outOfBoundsErrorProvider = (v, n) => this.outOfRangeError(v, n);
	}

	public get assert(): AssertExact<BoundedNumber<N>> {
		return this.assertWith();
	}

	public assertWith<Options extends ReboundFnOptions>(options?: Options): Options extends ReboundAllowUndef ? AssertIfPresent<BoundedNumber<N>> : AssertExact<BoundedNumber<N>> {
		const config = this.withOptions(options, "assert");
		const guard = ifIfPresent(config.ifPresent, this.guardWith({ ifPresent: true }), this.guard);
		return this.cacheFn(config, () => assertForBounds(guard, config.errorProvider, config.ifPresent));
	}

	private cacheFn<F extends AnyFunction>(options: ResolvedFnOptions, compute: () => F): F {
		const key = options.defaultName.concat(":", options.fnName, ":", options.errorProvider.name);
		return computeIfAbsent(key, this.fnCache as Map<string, F>, compute);
	}

	public get ceil(): ConvertTo<N> {
		return this.toIntWith({ strategy: CEIL });
	}

	public get floor(): ConvertTo<N> {
		return this.toIntWith({ strategy: FLOOR });
	}

	public get fromNumber(): FromNumber<N> {
		return this.fromNumberWith({ ifPresent: false });
	}

	public fromNumberWith<Options extends ReboundFnOptions>(options?: Options): Options extends ReboundAllowUndef ? FromNumberIfPresent<N> : FromNumber<N> {
		const config = this.withOptions(options, "", "FromNumber");
		return this.cacheFn(config, () => fromNumberForBounds(this.guard, config.errorProvider, config.ifPresent, config.fnName)) as Options extends ReboundAllowUndef ? FromNumberIfPresent<N> : FromNumber<N>;
	}

	public get guard(): GuardExact<N> {
		return this.guardWith({ ifPresent: false });
	};

	public guardWith<Options extends Omit<ReboundFnOptions, "errorProvider">>(options?: Options): If<Options["ifPresent"], GuardIfPresent<N>, GuardExact<N>> {
		const config = this.withOptions(options, "is");
		return this.cacheFn(
			config,
			() => guardForBounds(this.range, this.typeName, config.fnName, config.ifPresent) as If<Options["ifPresent"], GuardIfPresent<N>, GuardExact<N>>,
		);
	}

	public get integers(): Generator<N, undefined, undefined> {
		return this.integersWith();
	}

	public integersWith(options: IntegerGeneratorOptions = {}): Generator<N, undefined, undefined> {
		return integerGenerator(this.range, options);
	}

	public outOfRangeError(value: unknown, name?: string | undefined): RangeError {
		const type = value === null ? "null" : value === undefined ? "undefined" : typeof value;
		return scrubStackTrace(new RangeError(`Expected ${ name == null ? "" : name.concat(":") } ${ this.typeName } ${ this.range.toString() }, actual: ${ type === "number" ? value as number : type }`), /at ((?:Rebound[.])?outOfRangeError|buildError)/);
	}

	public get random(): RandomBounded<N> {
		return this.randomWith();
	}

	public randomWith(options: ReboundRandomOptions | undefined = {}): RandomBounded<N> {
		const defaultName = `random${ this.typeName }`;
		const {
			fnName = defaultName,
			rng,
		} = options;
		return this.cacheFn({
			defaultName,
			errorProvider: this.outOfBoundsErrorProvider,
			fnName: options?.fnName ?? defaultName,
			ifPresent: false,
		}, () => randomBounded(this.typeName, this.range.label, this.range.isLowerInc, this.range.lower, this.range.isInt, this.range.upper, this.range.isUpperInc, rng, fnName));
	}

	public get round(): ConvertTo<N> {
		return this.toIntWith({ strategy: ROUND });
	}

	public toIntWith<Options extends ReboundToIntOptions>(options: Options): ConvertTo<N> {
		const config = this.withIntStrategy(options);
		const { errorProvider, fnName, ifPresent, strategy } = config;
		return this.cacheFn(config, () => integerFrom(this.typeName, this.range, errorProvider, ifPresent, strategy, fnName));
	}

	public get trunc(): ConvertTo<N> {
		return this.toIntWith({ strategy: TRUNC });
	}

	protected withIntStrategy(options: ReboundToIntOptions | undefined): ResolvedToIntOptions {
		const prefix = typeof options?.strategy === "function" ? "toInt" : (options?.strategy ?? ROUND);
		const config = this.withOptions(options, prefix);
		const strategy = options?.strategy ?? ROUND;
		return { ...config, strategy };
	}

	protected withOptions(options: ReboundFnOptions | undefined, prefix: string, suffix: string = ""): ResolvedFnOptions {
		const ifPresent = options?.ifPresent ?? false;
		const errorProvider = options?.errorProvider ?? this.outOfBoundsErrorProvider;
		const defaultName = `${ prefix }${ prefix === "" ? lowerFirst(this.typeName) : this.typeName }${ suffix }${ ifPresent ? "IfPresent" : "" }`;
		const fnName = options?.fnName ?? defaultName;
		return { defaultName, errorProvider, fnName, ifPresent };
	}

	public get [ BOUNDS ](): this {
		return this;
	}
}
