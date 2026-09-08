import Blog from '@/logaxp/sections/Blog';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Articles',description:'Practical notes on software projects, product design and people operations from LogaXP.'};
export default function Articles(){return <main className="pt-12"><Blog/></main>}
