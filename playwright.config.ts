import {defineConfig,devices} from "@playwright/test";

const useInstalledChrome = process.env.EDUPLAN_E2E_CHROME === "1";

export default defineConfig({
 testDir:"./e2e",
 timeout:30_000,
 expect:{timeout:8_000},
 fullyParallel:false,
 forbidOnly:!!process.env.CI,
 retries:process.env.CI?1:0,
 reporter:"list",
 use:{
  baseURL:"http://127.0.0.1:4177",
  acceptDownloads:true,
  screenshot:"only-on-failure",
  trace:"retain-on-failure",
  ...(useInstalledChrome?{channel:"chrome" as const}:{}),
 },
 projects:[
  {name:"desktop-chromium",use:{...devices["Desktop Chrome"],viewport:{width:1280,height:900}}},
  {name:"mobile-chromium",use:{...devices["iPhone 13"],browserName:"chromium",viewport:{width:390,height:844}}},
 ],
 webServer:{
  command:"npm run preview -- --host 127.0.0.1 --port 4177 --strictPort",
  url:"http://127.0.0.1:4177/",
  timeout:60_000,
  reuseExistingServer:!process.env.CI,
 },
});
