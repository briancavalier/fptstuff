export const all = <Refinements extends readonly ((x: any) => x is unknown)[]>(...r: Refinements) =>
  <I extends Input<Refinements>>(x: I): x is I & All<Refinements> => r.every(r => r(x))

export const any = <Refinements extends readonly ((x: any) => x is unknown)[]>(...r: Refinements) =>
  <I extends Input<Refinements>>(x: I): x is I & Any<Refinements> => r.some(r => r(x))

type Input<R> =
  R extends readonly [infer R1, ...infer Tail] ?
  R1 extends (x: infer A1) => x is any ? A1 | Input<Tail> : Input<Tail>
  : R extends readonly [] ? never
  : never

type All<R> =
  R extends readonly [infer R1, ...infer Tail] ?
  R1 extends (x: any) => x is infer A1 ? A1 & All<Tail> : All<Tail>
  : R extends readonly [] ? unknown
  : unknown

type Any<R> =
  R extends readonly [infer R1, ...infer Tail] ?
  R1 extends (x: any) => x is infer A1 ? A1 | Any<Tail> : Any<Tail>
  : R extends readonly [] ? never
  : never

type Int = { numberSystem: 'Int' }

type Eq<A> = { eq: A }
type GT<A> = { gt: A }
type LT<A> = { lt: A }
type Finite = { finite: true }

const isInteger = <N extends number>(n: N): n is N & Int => Number.isInteger(n)
const isFinite = <N extends number>(n: N): n is N & Finite => Number.isFinite(n)

const gt = <N extends number>(n: N) => <X extends number>(x: X): x is X & GT<N> => x > n
const lt = <N extends number>(n: N) => <X extends number>(x: X): x is X & LT<N> => x < n
const eq = <N extends number>(n: N) => <X extends number>(x: X): x is X & Eq<N> => x === n as number

const positive = gt(0)
const nonNegative = any(eq(0), gt(0))
const negative = lt(0)
const nonPositive = any(eq(0), lt(0))

const t1 = all(isInteger, positive, isFinite)

const x: number = 1
if (t1(x)) x
else x
