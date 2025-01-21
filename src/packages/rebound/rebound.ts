import { computeIfAbsent, lowerFirst } from "@rickosborne/foundation";
import { scrubStackTrace } from "@rickosborne/guard";
import type { AnyFunction } from "@rickosborne/typical";
import { type AssertExact, assertForBounds, type AssertIfPresent } from "./assert-bounded.js";
import { type FromNumber, fromNumberForBounds, type FromNumberIfPresent } from "./from-number-bounded.js";
import { type GuardExact, guardForBounds, type GuardIfPresent, type If } from "./guard-bounded.js";
import { CEIL, type ConvertTo, FLOOR, integerFrom, type IntStrategy, ROUND, TRUNC } from "./integer-from.js";
import { integerGenerator, type IntegerGeneratorOptions } from "./integer-generator.js";
import { type RandomBounded, randomBounded } from "./random-bounded.js";
import { rangeFromConfig } from "./range.js";
import { ReboundBuilder, type ReboundConfigBuilder } from "./rebound-builder.js";
import { type BoundedNumber, BOUNDS, type BoundsConfig, type BoundsLabel, type BoundsWithRange, INT_SET, LOWER_IN, type LowerInEx, type NumberSet, type OutOfBoundsErrorProvider, REAL_SET, type Rebounded, UPPER_IN, type UpperInEx } from "./spec.js";
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

export class Rebound<
	Range extends BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>,
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> implements BoundsWithRange<Range, LowerInc, Lower, Int, Upper, UpperInc>, Rebounded<Range, LowerInc, Lower, Int, Upper, UpperInc> {
	public static buildType(typeName: string): ReboundConfigBuilder<LowerInEx, number, NumberSet, number, UpperInEx> {
		return new ReboundBuilder(
			{} as BoundsConfig<LowerInEx, number, NumberSet, number, UpperInEx>,
			<LowerInc extends LowerInEx, Lower extends number, Int extends NumberSet, Upper extends number, UpperInc extends UpperInEx, Config extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>(
				config: Config,
			) => new Rebound<BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>, LowerInc, Lower, Int, Upper, UpperInc>(typeName, config));
	}

	private readonly fnCache = new Map<string, AnyFunction>();
	public readonly int: Int;
	public readonly isInt: boolean;
	public readonly isLowerInc: boolean;
	public readonly isReal: boolean;
	public readonly isUpperInc: boolean;
	public readonly lower: Lower;
	public readonly lowerInc: LowerInc;
	public readonly numberType: BoundedNumber<this> = NaN as BoundedNumber<this>;
	public readonly outOfBoundsErrorProvider: OutOfBoundsErrorProvider;
	public readonly range: Range;
	public readonly upper: Upper;
	public readonly upperInc: UpperInc;

	protected constructor(
		public readonly typeName: string,
		config: BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>,
	) {
		this.int = config.int;
		this.upper = config.upper;
		this.lower = config.lower;
		this.lowerInc = config.lowerInc;
		this.upperInc = config.upperInc;
		this.range = rangeFromConfig(config) as Range;
		this.isInt = config.int === INT_SET;
		this.isReal = config.int === REAL_SET;
		this.isLowerInc = config.lowerInc === LOWER_IN;
		this.isUpperInc = config.upperInc === UPPER_IN;
		this.outOfBoundsErrorProvider = (v, n) => this.outOfRangeError(v, n);
	}

	public get assert(): AssertExact<BoundedNumber<this>> {
		return this.assertWith();
	}

	public assertWith<Options extends ReboundFnOptions>(options?: Options): Options extends ReboundAllowUndef ? AssertIfPresent<BoundedNumber<this>> : AssertExact<BoundedNumber<this>> {
		const config = this.withOptions(options, "assert");
		const guard = ifIfPresent(config.ifPresent, this.guardWith({ ifPresent: true }), this.guard);
		return this.cacheFn(config, () => assertForBounds(guard, config.errorProvider, config.ifPresent));
	}

	private cacheFn<F extends AnyFunction>(options: ResolvedFnOptions, compute: () => F): F {
		const key = options.defaultName.concat(":", options.fnName, ":", options.errorProvider.name);
		return computeIfAbsent(key, this.fnCache as Map<string, F>, compute);
	}

	public get ceil(): ConvertTo<BoundedNumber<this>> {
		return this.toIntWith({ strategy: CEIL });
	}

	public get floor(): ConvertTo<BoundedNumber<this>> {
		return this.toIntWith({ strategy: FLOOR });
	}

	public get fromNumber(): FromNumber<BoundedNumber<this>> {
		return this.fromNumberWith({ ifPresent: false });
	}

	public fromNumberWith<Options extends ReboundFnOptions>(options?: Options): Options extends ReboundAllowUndef ? FromNumberIfPresent<BoundedNumber<this>> : FromNumber<BoundedNumber<this>> {
		const config = this.withOptions(options, "", "FromNumber");
		return this.cacheFn(config, () => fromNumberForBounds(this.guard, config.errorProvider, config.ifPresent, config.fnName)) as Options extends ReboundAllowUndef ? FromNumberIfPresent<BoundedNumber<this>> : FromNumber<BoundedNumber<this>>;
	}

	public get guard(): GuardExact<BoundedNumber<this>> {
		return this.guardWith({ ifPresent: false });
	};

	public guardWith<Options extends Omit<ReboundFnOptions, "errorProvider">>(options?: Options): If<Options["ifPresent"], GuardIfPresent<BoundedNumber<this>>, GuardExact<BoundedNumber<this>>> {
		const config = this.withOptions(options, "is");
		return this.cacheFn(
			config,
			() => guardForBounds(this, this.typeName, config.fnName, config.ifPresent) as If<Options["ifPresent"], GuardIfPresent<BoundedNumber<this>>, GuardExact<BoundedNumber<this>>>,
		);
	}

	public get integers(): Generator<BoundedNumber<this>, undefined, undefined> {
		return this.integersWith();
	}

	public integersWith(options: IntegerGeneratorOptions = {}): Generator<BoundedNumber<this>, undefined, undefined> {
		return integerGenerator(this, options);
	}

	public outOfRangeError(value: unknown, name?: string | undefined): RangeError {
		const type = value === null ? "null" : value === undefined ? "undefined" : typeof value;
		return scrubStackTrace(new RangeError(`Expected ${ name == null ? "" : name.concat(":") } ${ this.typeName } ${ this.range }, actual: ${ type === "number" ? value as number : type }`), /at ((?:Rebound[.])?outOfRangeError|buildError)/);
	}

	public get random(): RandomBounded<BoundedNumber<this>> {
		return this.randomWith();
	}

	public randomWith(options: ReboundRandomOptions | undefined = {}): RandomBounded<BoundedNumber<this>> {
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
		}, () => randomBounded(this.typeName, this.isLowerInc, this.lower, this.isInt, this.upper, this.isUpperInc, rng, fnName));
	}

	public get round(): ConvertTo<BoundedNumber<this>> {
		return this.toIntWith({ strategy: ROUND });
	}

	public toIntWith<Options extends ReboundToIntOptions>(options: Options): ConvertTo<BoundedNumber<this>> {
		const config = this.withIntStrategy(options);
		const { errorProvider, fnName, ifPresent, strategy } = config;
		return this.cacheFn(config, () => integerFrom(this.typeName, this, errorProvider, ifPresent, strategy, fnName));
	}

	public get trunc(): ConvertTo<BoundedNumber<this>> {
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
