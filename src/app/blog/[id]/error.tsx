"use client";
export default function ArticleError({reset}:{reset:()=>void}){return <main className="mx-auto max-w-3xl px-5 py-20"><h1 className="mango text-5xl">Articles are temporarily unavailable.</h1><p className="my-5">Please try again in a moment.</p><button className="rounded-full border px-6 py-3" onClick={reset}>Retry</button></main>}
