"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { A11y, Keyboard } from 'swiper/modules';
import { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { usePublicShowcases } from '@/logaxp/hooks/useShowcase';
export default function Blog(){
 const [slider,setSlider]=useState<SwiperType>();
 const query=usePublicShowcases({category:'articles',pageSize:50});
 return <section id="blog" className="py-4 md:py-8 px-4 md:px-24 min-h-screen"><div className="flex gap-6 md:flex-row flex-col pb-16 md:items-center md:justify-between"><h2 className="mango align-baseline tracking-wide font-bold text-6xl">Blog</h2><div className="flex gap-4 items-center"><button aria-label="Previous articles" onClick={()=>slider?.slidePrev()} className="p-4 rounded-full bg-black dark:bg-neutral-900"><ChevronLeft color="#86BF00"/></button><button aria-label="Next articles" onClick={()=>slider?.slideNext()} className="p-4 rounded-full bg-black dark:bg-neutral-900"><ChevronRight color="#86BF00"/></button></div></div>
 <p className="mb-8 max-w-2xl opacity-70">Practical notes from LogaXP. Our publishing workspace supports AI-assisted article drafting, with admin review before publication.</p>
 {query.isPending?<p role="status">Loading articles…</p>:query.isError?<div role="alert">Articles could not be loaded. <button className="underline" onClick={()=>query.refetch()}>Retry</button></div>:!query.data?.items.length?<p>New articles are on the way.</p>:<Swiper modules={[A11y,Keyboard]} keyboard={{enabled:true}} onSwiper={setSlider} breakpoints={{768:{slidesPerView:2}}} className="pt-16 w-full" slidesPerView={1} spaceBetween={48}>{query.data.items.map((article,index)=><SwiperSlide key={article.id}><Link href={`/blog/${article.slug}`} className="block"><Image src={article.heroUrl || `/images/${index%4+4}.png`} alt={article.title} className="w-full" width={800} height={500}/><p className="mango text-4xl mt-8 mb-2 font-black truncate">{article.title}</p><p className="opacity-70">{article.shortDescription}</p></Link></SwiperSlide>)}</Swiper>}
 </section>;
}
