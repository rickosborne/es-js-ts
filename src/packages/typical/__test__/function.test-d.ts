import { describe, expect, test } from "tstyche";
import type { AbstractConstructorOf, AnyConstructor, AnyConstructorLike, AnyConstructorOf, ConcreteConstructorOf, FunctionParams } from "../function.js";

abstract class Animal {
	// Note: protected constructor
	protected constructor(protected readonly name: string) {
	}
}

abstract class Vertebrate extends Animal {
	// Note: public constructor which overwrites the protected one.
	public constructor(name: string) {
		super(name);
	}
}

// Note: inherited (public) constructor.
class Fish extends Vertebrate {
}

class Mammal extends Vertebrate {
	// Note: different params
	public constructor(public readonly landSpeed: number, name: string) {
		super(name);
	}
}

class Amoeba {
	public constructor(public readonly hasFlagella: boolean) {
	}
}

describe("function.ts", () => {
	test("AnyConstructor", () => {
		// Nope.  Doesn't like the protected constructor.
		expect.skip(Animal).type.toBeAssignableTo<AnyConstructor>();
		expect(Vertebrate).type.toBeAssignableTo<AnyConstructor>();
		expect(Fish).type.toBeAssignableTo<AnyConstructor>();
		expect(Mammal).type.toBeAssignableTo<AnyConstructor>();
		expect(Amoeba).type.toBeAssignableTo<AnyConstructor>();
	});

	test("AnyConstructorLike", () => {
		// Nope.  Protected constructor.
		expect.skip(Animal).type.toBeAssignableTo<AnyConstructorLike<[ string ], Animal>>();
		expect(Vertebrate).type.toBeAssignableTo<AnyConstructorLike<[ string ], Animal>>();
		expect(Fish).type.toBeAssignableTo<AnyConstructorLike<[ string ], Animal>>();
		expect(Mammal).type.not.toBeAssignableTo<AnyConstructorLike<[ string ], Animal>>();
		expect(Mammal).type.toBeAssignableTo<AnyConstructorLike<[ number, string ], Animal>>();
		expect(Amoeba).type.toBeAssignableTo<AnyConstructorLike<[ boolean ], Amoeba>>();
	});

	test("AnyConstructorOf", () => {
		// Nope.  Protected constructor.
		expect.skip(Animal).type.toBeAssignableTo<AnyConstructorOf<Animal>>();
		expect(Vertebrate).type.toBeAssignableTo<AnyConstructorOf<Animal>>();
		expect(Fish).type.toBeAssignableTo<AnyConstructorOf<Animal>>();
		expect(Mammal).type.toBeAssignableTo<AnyConstructorOf<Animal>>();
		expect(Animal).type.not.toBeAssignableTo<AnyConstructorOf<Mammal>>();
		expect(Amoeba).type.toBeAssignableTo<AnyConstructorOf<Amoeba>>();
	});

	test("AbstractConstructorOf", () => {
		// Nope.  Protected constructor.
		expect.skip(Animal).type.toBeAssignableTo<AbstractConstructorOf<Animal>>();
		expect(Vertebrate).type.toBeAssignableTo<AbstractConstructorOf<Animal>>();
		expect(Fish).type.toBeAssignableTo<AbstractConstructorOf<Animal>>();
		expect(Mammal).type.toBeAssignableTo<AbstractConstructorOf<Animal>>();
		expect(Amoeba).type.toBeAssignableTo<AbstractConstructorOf<Amoeba>>();
		expect(Animal).type.not.toBeAssignableTo<AbstractConstructorOf<Mammal>>();
	});

	test("PublicConstructorOf", () => {
		// Nope.  Protected constructor.
		expect.skip(Animal).type.toBeAssignableTo<ConcreteConstructorOf<Animal>>();
		expect(Fish).type.toBeAssignableTo<ConcreteConstructorOf<Vertebrate>>();
		expect(Mammal).type.toBeAssignableTo<ConcreteConstructorOf<Animal>>();
		expect(Amoeba).type.toBeAssignableTo<ConcreteConstructorOf<Amoeba>>();

		// Because abstract.
		expect(Vertebrate).type.not.toBeAssignableTo<ConcreteConstructorOf<Animal>>();
		expect(Animal).type.not.toBeAssignableTo<ConcreteConstructorOf<Mammal>>();
	});

	test("FunctionParams", () => {
		expect<FunctionParams<(foo: boolean) => void>>().type.toBe<[ boolean ]>();
		expect<FunctionParams<Amoeba>>().type.toBeNever();
	});
});
