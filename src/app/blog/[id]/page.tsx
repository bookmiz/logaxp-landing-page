import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle } from '@/logaxp/lib/articles/server';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const article=await getArticle((await params).id);return {title:article?.title??'Article not found',description:article?.shortDescription,alternates:{canonical:`/blog/${(await params).id}`}};}
export default async function ArticlePage({params}:{params:Promise<{id:string}>}){
 const article=await getArticle((await params).id); if(!article) notFound();
 return <main className="px-4 md:px-24 pb-20"><section className="mt-16 flex flex-col items-center gap-8"><Link href="/blog" className="rounded-full border px-4 py-2 text-sm">All articles</Link><h1 className="text-center mango text-6xl md:text-8xl font-bold max-w-5xl">{article.title}</h1><time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString('en-US',{dateStyle:'long',timeZone:'UTC'})}</time><Image src={article.heroUrl||'/images/4.png'} alt={article.title} width={1200} height={700} className="w-full rounded-3xl"/></section><article className="mx-auto mt-12 max-w-3xl space-y-6 text-lg leading-8">{article.description?.split(/\n\s*\n/).map((paragraph,index)=><p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}</article><Link href="/contact" className="mx-auto mt-12 block w-fit rounded-full bg-[#86BF00] px-6 py-3 text-black font-bold">Discuss your project</Link></main>;
}
