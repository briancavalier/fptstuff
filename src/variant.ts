// Open variant type
type Tag<T> = { readonly tag: T }
type Variant<T, A> = Tag<T> & { readonly value: A }

const tag = <T extends string | symbol>(t: T) => ({ tag: t }) as const

const is = <T extends Tag<unknown>>(t: T) =>
  <A>(v: Variant<unknown, A>): v is Variant<T['tag'], A> => v.tag === t.tag

const of = <T extends Tag<unknown>>(t: T) =>
  <A>(a: A): Variant<T['tag'], A> => ({ tag: t.tag, value: a }) as const

// Pattern match, matchers first, variant second
const match = <M extends Record<string | symbol, (a: any) => unknown>>(matches: M) => <V extends VariantsFor<M>>(v: V): ResultOf<M, V> =>
  (matches[(v.tag) as keyof M] as any)(v.value) // safe, but how to reduce casting?

// Flipped version of match, variant first, matchers second
const matchr = <V extends Variant<string | symbol, unknown>>(v: V) => <M extends Matcher<V>>(matches: M): ResultOf<M, V> =>
  (matches[(v.tag) as keyof M] as any)(v.value) // safe, but how to reduce casting?

const map = <M extends Record<string | symbol, (a: any) => unknown>>(mappers: M) => <V extends VariantsFor<M>>(vf: V): MapVariants<M, V> =>
  of(tag(vf.tag as any))((mappers[(vf.tag) as keyof M] as any)(vf.value)) as MapVariants<M, V> // safe, but how to reduce casting?

type MapVariants<M, V> = V extends Variant<infer T extends keyof M, infer A> ?
  M extends Record<T, (a: A) => infer B> ? Variant<T, B>
  : never
  : never

// Example
const left = tag('left')
const right = tag('right')

const t = of(right)(123)

if (is(right)(t)) {
  t
} else {
  t
}

const r1 = match({
  right: (x: number) => String(x),
  left: (x: string) => x.length
})(t)

const r2 = matchr(t)({
  right: (x: number) => String(x),
  left: (x: string) => x.length
})

const r3 = map({
  right: (x: number) => String(x),
  left: (x: string) => x.length
})(t)

console.log(r1, r2, r3)

// Supporting types
type VariantsFor<M extends Record<string, unknown>> = {
  [K in keyof M]: M[K] extends (a: infer A) => unknown ? Variant<K, A> : never
}[keyof M]

type ResultOf<M, V> = V extends Variant<infer T extends keyof M, infer A> ?
  M extends Record<T, (a: A) => infer B> ? B
  : never
  : never

type UnionToIntersection<T> =
  (T extends any ? (x: T) => any : never) extends
  (x: infer R) => any ? R : never

type Matchers<V extends Variant<string | symbol, unknown>> =
  V extends Variant<infer T extends string, infer A> ? Record<T, (a: A) => unknown>
  : never

type Matcher<V extends Variant<string | symbol, unknown>> = UnionToIntersection<Matchers<V>>
