"use client";
import gsap from 'gsap';
import MouseFollower from 'mouse-follower';
import {useEffect} from 'react';
MouseFollower.registerGSAP(gsap);
export default function Cursor(){useEffect(()=>{const media=window.matchMedia('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');let cursor:MouseFollower|undefined;const update=()=>{cursor?.destroy();cursor=undefined;if(media.matches){cursor=new MouseFollower({container:document.body,hideTimeout:2000,speed:0.6});cursor.setSkewing(3);cursor.show();}};update();media.addEventListener('change',update);return()=>{media.removeEventListener('change',update);cursor?.destroy();};},[]);return null;}
