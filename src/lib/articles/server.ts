import 'server-only';
export type Article={id:string;slug:string;title:string;shortDescription?:string;description?:string;heroUrl?:string;publishedAt:string;categories?:Array<{category:{slug:string}}>};
const base=()=> (process.env.API_INTERNAL_URL||process.env.NEXT_PUBLIC_API_URL||'http://localhost:5500/api/v1').replace(/\/$/,'');
export async function getArticle(slug:string):Promise<Article|null>{
 const response=await fetch(`${base()}/showcases/${encodeURIComponent(slug)}`,{cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(response.status===404) return null;
 if(!response.ok) throw new Error('Articles are temporarily unavailable');
 const row=await response.json() as Article;
 return row.categories?.some(c=>c.category.slug==='articles')?row:null;
}
