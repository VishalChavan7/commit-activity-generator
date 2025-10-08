var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/rng.ts
var RNG = class {
};

// src/generators/function.ts
var FunctionRNG = class _FunctionRNG extends RNG {
  constructor(rngFn) {
    var _a;
    super();
    __publicField(this, "_name");
    __publicField(this, "_rngFn");
    this._name = (_a = rngFn.name) != null ? _a : "function";
    this._rngFn = rngFn;
  }
  get name() {
    return this._name;
  }
  next() {
    return this._rngFn();
  }
  clone() {
    return new _FunctionRNG(this._rngFn);
  }
};

// src/utils.ts
function createRNG(seedOrRNG) {
  switch (typeof seedOrRNG) {
    case "object":
      if (seedOrRNG instanceof RNG) {
        return seedOrRNG;
      }
      break;
    case "function":
      return new FunctionRNG(seedOrRNG);
    default:
      return new ARC4RNG(seedOrRNG);
  }
  throw new Error(`invalid RNG seed or instance "${seedOrRNG}"`);
}
function mixKey(seed, key) {
  var _a;
  const seedStr = `${seed}`;
  let smear = 0;
  let j = 0;
  while (j < seedStr.length) {
    key[255 & j] = 255 & (smear ^= ((_a = key[255 & j]) != null ? _a : 0) * 19) + seedStr.charCodeAt(j++);
  }
  if (!key.length) {
    return [0];
  }
  return key;
}
function shuffleInPlace(gen, array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(gen.next() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}
function sparseFisherYates(gen, array, k) {
  var _a, _b;
  const H = /* @__PURE__ */ new Map();
  const lastIndex = array.length - 1;
  const result = Array.from({ length: k });
  for (let i = 0; i < k; i++) {
    const remaining = lastIndex - i + 1;
    const r = Math.floor(gen.next() * remaining);
    result[i] = array[(_a = H.get(r)) != null ? _a : r];
    H.set(r, (_b = H.get(lastIndex - i)) != null ? _b : lastIndex - i);
  }
  return result;
}

// src/generators/arc4.ts
var _arc4_startdenom = 281474976710656;
var _arc4_significance = 4503599627370496;
var _arc4_overflow = 9007199254740992;
var ARC4RNG = class _ARC4RNG extends RNG {
  constructor(seed = crypto.randomUUID()) {
    super();
    __publicField(this, "_seed");
    __publicField(this, "i");
    __publicField(this, "j");
    __publicField(this, "S");
    this._seed = seed;
    const key = mixKey(seed, []);
    const S = [];
    const keylen = key.length;
    this.i = 0;
    this.j = 0;
    this.S = S;
    let i = 0;
    while (i <= 255) {
      S[i] = i++;
    }
    for (let i2 = 0, j = 0; i2 <= 255; i2++) {
      const t = S[i2];
      j = 255 & j + key[i2 % keylen] + t;
      S[i2] = S[j];
      S[j] = t;
    }
    this.g(256);
  }
  get name() {
    return "arc4";
  }
  next() {
    let n = this.g(6);
    let d = _arc4_startdenom;
    let x = 0;
    while (n < _arc4_significance) {
      n = (n + x) * 256;
      d *= 256;
      x = this.g(1);
    }
    while (n >= _arc4_overflow) {
      n /= 2;
      d /= 2;
      x >>>= 1;
    }
    return (n + x) / d;
  }
  g(count) {
    const { S } = this;
    let { i, j } = this;
    let r = 0;
    while (count--) {
      i = 255 & i + 1;
      const t = S[i];
      S[j] = t;
      j = 255 & j + t;
      S[i] = S[j];
      r = r * 256 + S[255 & S[i] + t];
    }
    this.i = i;
    this.j = j;
    return r;
  }
  clone() {
    return new _ARC4RNG(this._seed);
  }
};

// src/generators/math-random.ts
var MathRandomRNG = class _MathRandomRNG extends RNG {
  get name() {
    return "Math.random";
  }
  next() {
    return Math.random();
  }
  clone() {
    return new _MathRandomRNG();
  }
};

// src/generators/xor128.ts
var XOR128RNG = class _XOR128RNG extends RNG {
  constructor(seed = crypto.randomUUID()) {
    super();
    __publicField(this, "_seed");
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    __publicField(this, "w");
    this._seed = seed;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
    let strSeed = "";
    if (typeof seed === "number") {
      this.x = seed;
    } else {
      strSeed += `${seed}`;
    }
    for (let i = 0; i < strSeed.length + 64; ++i) {
      this.x ^= strSeed.charCodeAt(i) | 0;
      this.next();
    }
  }
  get name() {
    return "xor128";
  }
  next() {
    const t = this.x ^ this.x << 11;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = this.w ^ (this.w >>> 19 ^ t ^ t >>> 8);
    return (this.w >>> 0) / 4294967296;
  }
  clone() {
    return new _XOR128RNG(this._seed);
  }
};

// src/validation.ts
function numberValidator(num) {
  return new NumberValidator(num);
}
var NumberValidator = class {
  constructor(num) {
    __publicField(this, "n");
    __publicField(this, "isInt", () => {
      if (Number.isInteger(this.n)) {
        return this;
      }
      throw new Error(`Expected number to be an integer, got ${this.n}`);
    });
    __publicField(this, "isPositive", () => {
      if (this.n > 0) {
        return this;
      }
      throw new Error(`Expected number to be positive, got ${this.n}`);
    });
    __publicField(this, "lessThan", (v) => {
      if (this.n < v) {
        return this;
      }
      throw new Error(`Expected number to be less than ${v}, got ${this.n}`);
    });
    __publicField(this, "lessThanOrEqual", (v) => {
      if (this.n <= v) {
        return this;
      }
      throw new Error(
        `Expected number to be less than or equal to ${v}, got ${this.n}`
      );
    });
    __publicField(this, "greaterThanOrEqual", (v) => {
      if (this.n >= v) {
        return this;
      }
      throw new Error(
        `Expected number to be greater than or equal to ${v}, got ${this.n}`
      );
    });
    __publicField(this, "greaterThan", (v) => {
      if (this.n > v) {
        return this;
      }
      throw new Error(`Expected number to be greater than ${v}, got ${this.n}`);
    });
    this.n = num;
  }
};

// src/distributions/bates.ts
function bates(random, n = 1) {
  numberValidator(n).isInt().isPositive();
  const irwinHall2 = random.irwinHall(n);
  return () => {
    return irwinHall2() / n;
  };
}

// src/distributions/bernoulli.ts
function bernoulli(random, p = 0.5) {
  numberValidator(p).greaterThanOrEqual(0).lessThanOrEqual(1);
  return () => {
    return Math.min(1, Math.floor(random.next() + p));
  };
}

// src/distributions/binomial.ts
function binomial(random, n = 1, p = 0.5) {
  numberValidator(n).isInt().isPositive();
  numberValidator(p).greaterThanOrEqual(0).lessThan(1);
  return () => {
    let i = 0;
    let x = 0;
    while (i++ < n) {
      if (random.next() < p) {
        x++;
      }
    }
    return x;
  };
}

// src/distributions/exponential.ts
function exponential(random, lambda = 1) {
  numberValidator(lambda).isPositive();
  return () => {
    return -Math.log(1 - random.next()) / lambda;
  };
}

// src/distributions/geometric.ts
function geometric(random, p = 0.5) {
  numberValidator(p).greaterThan(0).lessThan(1);
  const invLogP = 1 / Math.log(1 - p);
  return () => {
    return Math.floor(1 + Math.log(random.next()) * invLogP);
  };
}

// src/distributions/irwin-hall.ts
function irwinHall(random, n = 1) {
  numberValidator(n).isInt().greaterThanOrEqual(0);
  return () => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += random.next();
    }
    return sum;
  };
}

// src/distributions/log-normal.ts
function logNormal(random, mu = 0, sigma = 1) {
  const normal2 = random.normal(mu, sigma);
  return () => {
    return Math.exp(normal2());
  };
}

// src/distributions/normal.ts
function normal(random, mu = 0, sigma = 1) {
  return () => {
    let x, y, r;
    do {
      x = random.next() * 2 - 1;
      y = random.next() * 2 - 1;
      r = x * x + y * y;
    } while (!r || r > 1);
    return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
  };
}

// src/distributions/pareto.ts
function pareto(random, alpha = 1) {
  numberValidator(alpha).greaterThanOrEqual(0);
  const invAlpha = 1 / alpha;
  return () => {
    return 1 / Math.pow(1 - random.next(), invAlpha);
  };
}

// src/distributions/poisson.ts
var logFactorialTable = [
  0,
  0,
  0.6931471805599453,
  1.791759469228055,
  3.1780538303479458,
  4.787491742782046,
  6.579251212010101,
  8.525161361065415,
  10.60460290274525,
  12.801827480081469
];
var logFactorial = (k) => {
  return logFactorialTable[k];
};
var logSqrt2PI = 0.9189385332046727;
function poisson(random, lambda = 1) {
  numberValidator(lambda).isPositive();
  if (lambda < 10) {
    const expMean = Math.exp(-lambda);
    return () => {
      let p = expMean;
      let x = 0;
      let u = random.next();
      while (u > p) {
        u = u - p;
        p = lambda * p / ++x;
      }
      return x;
    };
  } else {
    const smu = Math.sqrt(lambda);
    const b = 0.931 + 2.53 * smu;
    const a = -0.059 + 0.02483 * b;
    const invAlpha = 1.1239 + 1.1328 / (b - 3.4);
    const vR = 0.9277 - 3.6224 / (b - 2);
    return () => {
      var _a;
      while (true) {
        let u;
        let v = random.next();
        if (v <= 0.86 * vR) {
          u = v / vR - 0.43;
          return Math.floor(
            (2 * a / (0.5 - Math.abs(u)) + b) * u + lambda + 0.445
          );
        }
        if (v >= vR) {
          u = random.next() - 0.5;
        } else {
          u = v / vR - 0.93;
          u = (u < 0 ? -0.5 : 0.5) - u;
          v = random.next() * vR;
        }
        const us = 0.5 - Math.abs(u);
        if (us < 0.013 && v > us) {
          continue;
        }
        const k = Math.floor((2 * a / us + b) * u + lambda + 0.445);
        v = v * invAlpha / (a / (us * us) + b);
        if (k >= 10) {
          const t = (k + 0.5) * Math.log(lambda / k) - lambda - logSqrt2PI + k - (1 / 12 - (1 / 360 - 1 / (1260 * k * k)) / (k * k)) / k;
          if (Math.log(v * smu) <= t) {
            return k;
          }
        } else if (k >= 0) {
          const f = (_a = logFactorial(k)) != null ? _a : 0;
          if (Math.log(v) <= k * Math.log(lambda) - lambda - f) {
            return k;
          }
        }
      }
    };
  }
}

// src/distributions/uniform.ts
function uniform(random, min = 0, max = 1) {
  return () => {
    return random.next() * (max - min) + min;
  };
}

// src/distributions/uniform-boolean.ts
function uniformBoolean(random) {
  return () => {
    return random.next() >= 0.5;
  };
}

// src/distributions/uniform-int.ts
function uniformInt(random, min = 0, max = 1) {
  if (max === void 0) {
    max = min === void 0 ? 1 : min;
    min = 0;
  }
  numberValidator(min).isInt();
  numberValidator(max).isInt();
  return () => {
    return Math.floor(random.next() * (max - min + 1) + min);
  };
}

// src/distributions/weibull.ts
function weibull(random, lambda, k) {
  numberValidator(lambda).greaterThan(0);
  numberValidator(k).greaterThan(0);
  return () => {
    const u = 1 - random.next();
    return lambda * Math.pow(-Math.log(u), 1 / k);
  };
}

// src/random.ts
var Random = class _Random {
  constructor(seedOrRNG = new MathRandomRNG()) {
    __publicField(this, "_rng");
    __publicField(this, "_cache", {});
    this._rng = createRNG(seedOrRNG);
  }
  /**
   * @member {RNG} rng - Underlying pseudo-random number generator.
   */
  get rng() {
    return this._rng;
  }
  /**
   * Creates a new `Random` instance, optionally specifying parameters to
   * set a new seed.
   */
  clone(seedOrRNG = this.rng.clone()) {
    return new _Random(seedOrRNG);
  }
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
  use(seedOrRNG) {
    this._rng = createRNG(seedOrRNG);
    this._cache = {};
  }
  // --------------------------------------------------------------------------
  // Uniform utility functions
  // --------------------------------------------------------------------------
  /**
   * Convenience wrapper around `this.rng.next()`
   *
   * Returns a floating point number in [0, 1).
   *
   * @return {number}
   */
  next() {
    return this._rng.next();
  }
  /**
   * Samples a uniform random floating point number, optionally specifying
   * lower and upper bounds.
   *
   * Convenience wrapper around `random.uniform()`
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   */
  float(min, max) {
    return this.uniform(min, max)();
  }
  /**
   * Samples a uniform random integer, optionally specifying lower and upper
   * bounds.
   *
   * Convenience wrapper around `random.uniformInt()`
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  int(min, max) {
    return this.uniformInt(min, max)();
  }
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
  integer(min, max) {
    return this.uniformInt(min, max)();
  }
  /**
   * Samples a uniform random boolean value.
   *
   * Convenience wrapper around `random.uniformBoolean()`
   *
   * @alias `random.boolean`
   */
  bool() {
    return this.uniformBoolean()();
  }
  /**
   * Samples a uniform random boolean value.
   *
   * Convenience wrapper around `random.uniformBoolean()`
   */
  boolean() {
    return this.uniformBoolean()();
  }
  /**
   * Returns an item chosen uniformly at random from the given array.
   *
   * Convenience wrapper around `random.uniformInt()`
   *
   * @param {Array<T>} [array] - Input array
   */
  choice(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.choice expected input to be an array, got ${typeof array}`
      );
    }
    const length = array.length;
    if (length > 0) {
      const index = this.uniformInt(0, length - 1)();
      return array[index];
    } else {
      return void 0;
    }
  }
  /**
   * Returns a random subset of k items from the given array (without replacement).
   *
   * @param {Array<T>} [array] - Input array
   */
  sample(array, k) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.sample expected input to be an array, got ${typeof array}`
      );
    }
    if (k < 0 || k > array.length) {
      throw new Error(
        `Random.sample: k must be between 0 and array.length (${array.length}), got ${k}`
      );
    }
    return sparseFisherYates(this.rng, array, k);
  }
  /**
   * Generates a thunk which returns samples of size k from the given array.
   *
   * This is for convenience only; there is no gain in efficiency.
   *
   * @param {Array<T>} [array] - Input array
   */
  sampler(array, k) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.sampler expected input to be an array, got ${typeof array}`
      );
    }
    if (k < 0 || k > array.length) {
      throw new Error(
        `Random.sampler: k must be between 0 and array.length (${array.length}), got ${k}`
      );
    }
    const gen = this.rng;
    return () => {
      return sparseFisherYates(gen, array, k);
    };
  }
  /**
   * Returns a shuffled copy of the given array.
   *
   * @param {Array<T>} [array] - Input array
   */
  shuffle(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.shuffle expected input to be an array, got ${typeof array}`
      );
    }
    const copy = [...array];
    shuffleInPlace(this.rng, copy);
    return copy;
  }
  /**
   * Generates a thunk which returns shuffled copies of the given array.
   *
   * @param {Array<T>} [array] - Input array
   */
  shuffler(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.shuffler expected input to be an array, got ${typeof array}`
      );
    }
    const gen = this.rng;
    const copy = [...array];
    return () => {
      shuffleInPlace(gen, copy);
      return [...copy];
    };
  }
  // --------------------------------------------------------------------------
  // Uniform distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Continuous uniform distribution](https://en.wikipedia.org/wiki/Uniform_distribution_(continuous)).
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   */
  uniform(min, max) {
    return this._memoize("uniform", uniform, min, max);
  }
  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution).
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  uniformInt(min, max) {
    return this._memoize("uniformInt", uniformInt, min, max);
  }
  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution),
   * with two possible outcomes, `true` or `false.
   *
   * This method is analogous to flipping a coin.
   */
  uniformBoolean() {
    return this._memoize("uniformBoolean", uniformBoolean);
  }
  // --------------------------------------------------------------------------
  // Normal distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
   *
   * @param {number} [mu=0] - Mean
   * @param {number} [sigma=1] - Standard deviation
   */
  normal(mu, sigma) {
    return normal(this, mu, sigma);
  }
  /**
   * Generates a [Log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution).
   *
   * @param {number} [mu=0] - Mean of underlying normal distribution
   * @param {number} [sigma=1] - Standard deviation of underlying normal distribution
   */
  logNormal(mu, sigma) {
    return logNormal(this, mu, sigma);
  }
  // --------------------------------------------------------------------------
  // Bernoulli distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Bernoulli distribution](https://en.wikipedia.org/wiki/Bernoulli_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  bernoulli(p) {
    return bernoulli(this, p);
  }
  /**
   * Generates a [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution).
   *
   * @param {number} [n=1] - Number of trials.
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  binomial(n, p) {
    return binomial(this, n, p);
  }
  /**
   * Generates a [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  geometric(p) {
    return geometric(this, p);
  }
  // --------------------------------------------------------------------------
  // Poisson distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
   *
   * @param {number} [lambda=1] - Mean (lambda > 0)
   */
  poisson(lambda) {
    return poisson(this, lambda);
  }
  /**
   * Generates an [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution).
   *
   * @param {number} [lambda=1] - Inverse mean (lambda > 0)
   */
  exponential(lambda) {
    return exponential(this, lambda);
  }
  // --------------------------------------------------------------------------
  // Misc distributions
  // --------------------------------------------------------------------------
  /**
   * Generates an [Irwin Hall distribution](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to sum (n >= 0)
   */
  irwinHall(n) {
    return irwinHall(this, n);
  }
  /**
   * Generates a [Bates distribution](https://en.wikipedia.org/wiki/Bates_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to average (n >= 1)
   */
  bates(n) {
    return bates(this, n);
  }
  /**
   * Generates a [Pareto distribution](https://en.wikipedia.org/wiki/Pareto_distribution).
   *
   * @param {number} [alpha=1] - Alpha
   */
  pareto(alpha) {
    return pareto(this, alpha);
  }
  /**
   * Generates a [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution).
   *
   * @param {number} [lambda] - Lambda, the scale parameter
   * @param {number} [k] - k, the shape parameter
   */
  weibull(lambda, k) {
    return weibull(this, lambda, k);
  }
  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------
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
  _memoize(label, getter, ...args) {
    const key = `${args.join(";")}`;
    let value = this._cache[label];
    if (value === void 0 || value.key !== key) {
      value = {
        key,
        distribution: getter(this, ...args)
      };
      this._cache[label] = value;
    }
    return value.distribution;
  }
};
var random_default = new Random();
export {
  ARC4RNG,
  FunctionRNG,
  MathRandomRNG,
  RNG,
  Random,
  XOR128RNG,
  createRNG,
  random_default as default,
  mixKey,
  shuffleInPlace,
  sparseFisherYates
};
//# sourceMappingURL=index.js.map