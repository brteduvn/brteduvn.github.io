import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";
import {readFileSync} from "node:fs";

const pkg=JSON.parse(readFileSync(new URL("./package.json",import.meta.url),"utf8")) as {version:string};
const now=new Date();
const buildInfo={
 version:pkg.version,
 builtAtUTC:now.toISOString(),
 builtAtVietnam:new Intl.DateTimeFormat("vi-VN",{
  timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit",
  hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false
 }).format(now)+" (Asia/Ho_Chi_Minh)",
};
// GitHub user-site repository brteduvn.github.io serves the root path.
export default defineConfig({
 base:"/",
 plugins:[
  react(),
  VitePWA({
   registerType:"autoUpdate",
   injectRegister:"auto",
   includeAssets:["icon.svg","icons/icon-192.png","icons/icon-512.png"],
   manifest:{
    name:"EduPlan OSS — Kế hoạch giáo dục",
    short_name:"EduPlan",
    description:"Soạn và xuất kế hoạch giáo dục miễn phí, đơn giản và riêng tư",
    lang:"vi",start_url:"./",scope:"./",display:"standalone",
    background_color:"#f8faf9",theme_color:"#147e65",
    icons:[
     {src:"icons/icon-192.png",sizes:"192x192",type:"image/png"},
     {src:"icons/icon-512.png",sizes:"512x512",type:"image/png"},
     {src:"icons/icon-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"},
    ],
   },
   workbox:{
    globPatterns:["**/*.{html,js,css,svg,png,webmanifest,json,mjs}"],
    maximumFileSizeToCacheInBytes:5*1024*1024,
    navigateFallback:"index.html",
    cleanupOutdatedCaches:true,
   },
  }),
  {
   name:"eduplan-build-metadata",
   generateBundle(){
    this.emitFile({type:"asset",fileName:"build-info.json",source:JSON.stringify(buildInfo,null,2)+"\n"});
   },
  },
 ],
 define:{"__EDUPLAN_BUILD_INFO__":JSON.stringify(buildInfo)},
});
