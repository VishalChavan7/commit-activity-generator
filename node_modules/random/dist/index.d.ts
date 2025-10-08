declare abstract class RNG {
    abstract get name(): string;
    abstract next(): number;
    abstract clone(): RNG;
}

type RNGFn = () => number;
type Seed = number | string;
type SeedOrRNG = number | string | RNGFn | RNG;

declare class ARC4RNG extends RNG {
    protected readonly _seed: Seed;
    i: number;
    j: number;
    S: number[];
    constructor(seed?: Seed);
    get name(): string;
    next(): number;
    g(count: number): number;
    clone(): ARC4RNG;
}

declare class FunctionRNG extends RNG {
    _name: string;
    _rngFn: RNGFn;
    constructor(rngFn: RNGFn);
    get name(): string;
    next(): number;
    clone(): FunctionRNG;
}

declare class MathRandomRNG extends RNG {
    get name(): string;
    next(): number;
    clone(): MathRandomRNG;
}

declare class XOR128RNG extends RNG {
    protected readonly _seed: Seed;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(seed?: Seed);
    get name(): string;
    next(): number;
    clone(): XOR128RNG;
}

/**
 * Distribution function
 */
type IDistFn<R> = (random: Random, ...argv: any) => R;
/**
 * Distribution
 */
type IDist<R> = () => R;
/**
 * Keyed cache entry
 */
interface ICacheEntry<T> {
    key: string;
    distribution: () => T;
}
/**
 * Seedable random number generator supporting many common distributions.
 *
 * @name Random
 * @class
 *
 * @param {RNG|function|string|number} [rng=Math.random] - Underlying random number generator or a seed for the default PRNG. Defaults to `Math.random`.
 */
declare class Random {
    protected _rng: RNG;
    protected _cache: {
        [k: string]: ICacheEntry<any>;
    };
    constructor(seedOrRNG?: SeedOrRNG);
    /**
     * @member {RNG} rng - Underlying pseudo-random number generator.
     */
    get rng(): RNG;
    /**
     * Creates a new `Random` instance, optionally specifying parameters to
     * set a new seed.
     */
    clone(seedOrRNG?: SeedOrRNG): Random;
    /**
     * Sets the underlying pseudorandom number generator.
     *
     * @example
     * ```ts
     * import random from 'random'
     *
     * random.use('example-seed')
     * // or
     * random.use(Math.random)
     * ```
     */
    use(seedOrRNG: SeedOrRNG): void;
    /**
     * Convenience wrapper around `this.rng.next()`
     *
     * Returns a floating point number in [0, 1).
     *
     * @return {number}
     */
    next(): number;
    /**
     * Samples a uniform random floating point number, optionally specifying
     * lower and upper bounds.
     *
     * Convenience wrapper around `random.uniform()`
     *
     * @param {number} [min=0] - Lower bound (float, inclusive)
     * @param {number} [max=1] - Upper bound (float, exclusive)
     */
    float(min?: number, max?: number): number;
    /**
     * Samples a uniform random integer, optionally specifying lower and upper
     * bounds.
     *
     * Convenience wrapper around `random.uniformInt()`
     *
     * @param {number} [min=0] - Lower bound (integer, inclusive)
     * @param {number} [max=1] - Upper bound (integer, inclusive)
     */
    int(min?: number, max?: number): number;
    /**
     * Samples a uniform random integer, optionally specifying lower and upper
     * bounds.
     *
     * Convenience wrapper around `random.uniformInt()`
     *
     * @alias `random.int`
     *
     * @param {number} [min=0] - Lower bound (integer, inclusive)
     * @param {number} [max=1] - Upper bound (integer, inclusive)
     */
    integer(min?: number, max?: number): number;
    /**
     * Samples a uniform random boolean value.
     *
     * Convenience wrapper around `random.uniformBoolean()`
     *
     * @alias `random.boolean`
     */
    bool(): boolean;
    /**
     * Samples a uniform random boolean value.
     *
     * Convenience wrapper around `random.uniformBoolean()`
     */
    boolean(): boolean;
    /**
     * Returns an item chosen uniformly at random from the given array.
     *
     * Convenience wrapper around `random.uniformInt()`
     *
     * @param {Array<T>} [array] - Input array
     */
    choice<T>(array: Array<T>): T | undefined;
    /**
     * Returns a random subset of k items from the given array (without replacement).
     *
     * @param {Array<T>} [array] - Input array
     */
    sample<T>(array: Array<T>, k: number): Array<T>;
    /**
     * Generates a thunk which returns samples of size k from the given array.
     *
     * This is for convenience only; there is no gain in efficiency.
     *
     * @param {Array<T>} [array] - Input array
     */
    sampler<T>(array: Array<T>, k: number): () => Array<T>;
    /**
     * Returns a shuffled copy of the given array.
     *
     * @param {Array<T>} [array] - Input array
     */
    shuffle<T>(array: Array<T>): Array<T>;
    /**
     * Generates a thunk which returns shuffled copies of the given array.
     *
     * @param {Array<T>} [array] - Input array
     */
    shuffler<T>(array: Array<T>): () => Array<T>;
    /**
     * Generates a [Continuous uniform distribution](https://en.wikipedia.org/wiki/Uniform_distribution_(continuous)).
     *
     * @param {number} [min=0] - Lower bound (float, inclusive)
     * @param {number} [max=1] - Upper bound (float, exclusive)
     */
    uniform(min?: number, max?: number): IDist<number>;
    /**
     * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution).
     *
     * @param {number} [min=0] - Lower bound (integer, inclusive)
     * @param {number} [max=1] - Upper bound (integer, inclusive)
     */
    uniformInt(min?: number, max?: number): IDist<number>;
    /**
     * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution),
     * with two possible outcomes, `true` or `false.
     *
     * This method is analogous to flipping a coin.
     */
    uniformBoolean(): IDist<boolean>;
    /**
     * Generates a [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
     *
     * @param {number} [mu=0] - Mean
     * @param {number} [sigma=1] - Standard deviation
     */
    normal(mu?: number, sigma?: number): IDist<number>;
    /**
     * Generates a [Log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution).
     *
     * @param {number} [mu=0] - Mean of underlying normal distribution
     * @param {number} [sigma=1] - Standard deviation of underlying normal distribution
     */
    logNormal(mu?: number, sigma?: number): IDist<number>;
    /**
     * Generates a [Bernoulli distribution](https://en.wikipedia.org/wiki/Bernoulli_distribution).
     *
     * @param {number} [p=0.5] - Success probability of each trial.
     */
    bernoulli(p?: number): IDist<number>;
    /**
     * Generates a [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution).
     *
     * @param {number} [n=1] - Number of trials.
     * @param {number} [p=0.5] - Success probability of each trial.
     */
    binomial(n?: number, p?: number): IDist<number>;
    /**
     * Generates a [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
     *
     * @param {number} [p=0.5] - Success probability of each trial.
     */
    geometric(p?: number): IDist<number>;
    /**
     * Generates a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
     *
     * @param {number} [lambda=1] - Mean (lambda > 0)
     */
    poisson(lambda?: number): IDist<number>;
    /**
     * Generates an [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution).
     *
     * @param {number} [lambda=1] - Inverse mean (lambda > 0)
     */
    exponential(lambda?: number): IDist<number>;
    /**
     * Generates an [Irwin Hall distribution](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).
     *
     * @param {number} [n=1] - Number of uniform samples to sum (n >= 0)
     */
    irwinHall(n?: number): IDist<number>;
    /**
     * Generates a [Bates distribution](https://en.wikipedia.org/wiki/Bates_distribution).
     *
     * @param {number} [n=1] - Number of uniform samples to average (n >= 1)
     */
    bates(n?: number): IDist<number>;
    /**
     * Generates a [Pareto distribution](https://en.wikipedia.org/wiki/Pareto_distribution).
     *
     * @param {number} [alpha=1] - Alpha
     */
    pareto(alpha?: number): IDist<number>;
    /**
     * Generates a [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution).
     *
     * @param {number} [lambda] - Lambda, the scale parameter
     * @param {number} [k] - k, the shape parameter
     */
    weibull(lambda: number, k: number): () => number;
    /**
     * Memoizes distributions to ensure they're only created when necessary.
     *
     * Returns a thunk which that returns independent, identically distributed
     * samples from the specified distribution.
     *
     * @internal
     *
     * @param {string} label - Name of distribution
     * @param {function} getter - Function which generates a new distribution
     * @param {...*} args - Distribution-specific arguments
     */
    protected _memoize<T>(label: string, getter: IDistFn<any>, ...args: any[]): IDist<T>;
}
declare const _default: Random;

declare function createRNG(seedOrRNG?: SeedOrRNG): RNG;
/**
 * Mixes a string seed into a key that is an array of integers, and returns a
 * shortened string seed that is equivalent to the result key.
 */
declare function mixKey(seed: Seed, key: number[]): number[];
declare function shuffleInPlace<T>(gen: RNG, array: Array<T>): void;
/**
 * Fisher-Yates sampling without replacement
 * O(k) time and space, by using a hash table instead of a full copy of the array
 * see https://arxiv.org/pdf/2104.05091 Algorithm 2
 */
declare function sparseFisherYates<T>(gen: RNG, array: Array<T>, k: number): T[];

export { ARC4RNG, FunctionRNG, MathRandomRNG, RNG, type RNGFn, Random, type Seed, type SeedOrRNG, XOR128RNG, createRNG, _default as default, mixKey, shuffleInPlace, sparseFisherYates };
