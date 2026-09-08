import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots {const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://www.logaxp.com';return {rules:{userAgent:'*',allow:'/',disallow:['/portal/','/admin/','/site-admin/','/auth/','/documents/','/accept-invitation','/verify-email']},sitemap:`${origin}/sitemap.xml`};}
