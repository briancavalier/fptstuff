// Open variant type
type Variant<T, A> = { readonly tag: T, readonly value: A }

const variant = <T>(t: T) =>
  <A>(a: A): Variant<T, A> => ({ tag: t, value: a }) as const

const is = <T>(t: T) =>
  <V extends Variant<unknown, unknown>>(v: V): v is V & Variant<T, unknown> => v.tag === t

// Pattern match, matchers first, variant second
const matcher = <M extends Record<string | symbol, (a: any) => unknown>>(matches: M) => <V extends VariantsFor<M>>(v: V): ResultOf<M, V> =>
  matches[(v.tag)](v.value) as ResultOf<M, V>// safe, but how to reduce casting?

// Flipped version of match, variant first, matchers second
const match = <V extends Variant<string | symbol, unknown>>(v: V) => <M extends Matcher<V>>(matches: M): ResultOf<M, V> =>
  matches[(v.tag)](v.value)

const map = <M extends Record<string | symbol, (a: any) => unknown>>(mappers: M) => <V extends VariantsFor<M>>(v: V): MapVariants<M, V> =>
  variant(v.tag)(matcher(mappers)(v)) as MapVariants<M, V> // safe, but how to reduce casting?

type MapVariants<M, V> = V extends Variant<infer T extends keyof M, infer A> ?
  M extends Record<T, (a: A) => infer B> ? Variant<T, B>
  : V
  : never

// Supporting types
type VariantsFor<M extends Record<string, unknown>> = Extract<{
  [K in keyof M]: M[K] extends (a: infer A) => unknown ? Variant<K, A> : never
}[keyof M], Variant<any, any>>

type ResultOf<M, V> = V extends Variant<infer T extends keyof M, infer A> ?
  M extends Record<T, (a: A) => infer B> ? B
  : never
  : never

type UnionToIntersection<T> =
  (T extends any ? (x: T) => any : never) extends
  (x: infer R) => any ? R : never

type Matchers<V extends Variant<string | symbol, unknown>> =
  V extends Variant<infer T extends string | symbol, infer A> ? Record<T, (a: A) => unknown>
  : {}

type Matcher<V extends Variant<string | symbol, unknown>> = UnionToIntersection<Matchers<V>>

// Example
// We can build Either using open variants

// variant tags for left and right
const Left = Symbol('Left')
const Right = Symbol('Right')

// Reconstruct an Either type
type Either<A, B> = Variant<typeof Left, A> | Variant<typeof Right, B>

// left and right constructors
const left = variant(Left)
const right = variant(Right)

const isLeft = is(Left)
const isRight = is(Right)

// Example smart constructor
const either = <A>(a: A | null | undefined): Either<null, A> =>
  a == null ? left(null) : right(a)

// Reconstruct the typical polymorphic map function for Either
const mapEither = <A, B, C>(g: (a: B) => C, v: Either<A, B>): Either<A, C> =>
  isLeft(v) ? v : right(g(v.value))

// Create an Either
const t = either(123)

// Map
const x = mapEither(x => String(x), t)

// Pattern match
const y = match(x)({
  [Right]: x => x.length > 0,
  [Left]: x => x
})

console.log(x, y)
