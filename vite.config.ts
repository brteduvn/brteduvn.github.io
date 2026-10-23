import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {readFileSync} from "node:fs";

const pkg=JSON.parse(readFileSync(new URL("./package.json",import.meta.url),"utf8")) as {version:string};
const now=new Date();
const buildInfo={
 version:pkg.version,
 builtAtUTC:now.toISOString(),
 builtAtVietnam:new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now)+" (Asia/Ho_Chi_Minh)"
};

export default defineConfig({
 plugins:[react(),{
  name:"eduplan-build-metadata",
  generateBundle(){
   this.emitFile({type:"asset",fileName:"build-info.json",source:JSON.stringify(buildInfo,null,2)+"\n"});
  }
 }],
 define:{"__EDUPLAN_BUILD_INFO__":JSON.stringify(buildInfo)},
 base:"./"
});
