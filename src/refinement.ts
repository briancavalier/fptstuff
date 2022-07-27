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

type Int = { system: 'Int' }

type Positive = { gt: 0 }

const isInteger = <N extends number>(n: N): n is N & Int => Number.isInteger(n)
const isPositive = <N extends number>(n: N): n is N & Positive => typeof n === 'number' && n > 0

type T = Any<[typeof isInteger<1>]>
const t1 = all(isInteger, isPositive)
const t2 = any(isInteger, isPositive)

const x = 1
if (t2(x)) x
else x
