import {test,expect} from "@playwright/test";
import JSZip from "jszip";
import path from "node:path";
import {readFile,mkdir} from "node:fs/promises";

const pdfFixture=path.join(process.cwd(),"tests/fixtures/sample-text.pdf");
const docxFixture=path.join(process.cwd(),"tests/fixtures/sample-template.docx");

test("homepage works at viewport width with no horizontal overflow",async({page},info)=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{name:/Soạn kế hoạch giáo dục/})).toBeVisible();
 await expect(page.getByText("Không cần tài khoản")).toBeVisible();
 await expect(page.locator("#sourceUpload")).toHaveAttribute("accept",/pdf/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow,"Unexpected horizontal scrolling at "+info.project.name).toBeLessThanOrEqual(1);
 await mkdir(path.join("artifacts","qa"),{recursive:true});
 await page.screenshot({path:path.join("artifacts","qa","layout-"+info.project.name+".png"),fullPage:true});
});
test("create a blank plan, export editable Word, restore saved draft",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:/Tạo kế hoạch mới từ đầu/}).click();
 await page.getByRole("textbox",{name:"Trường"}).fill("THCS Hòa Hiệp");
 await page.getByRole("textbox",{name:"Tên kế hoạch"}).fill("Kế hoạch khảo sát");
 await page.getByRole("textbox",{name:/Nội dung kế hoạch/}).fill("Tiết 1: Di sản địa phương\nTiết 2: Thực hành");
 await expect(page.getByText("Đã tự lưu trên thiết bị").first()).toBeVisible();
 await page.reload();
 await expect(page.getByRole("textbox",{name:"Tên kế hoạch"})).toHaveValue("Kế hoạch khảo sát");
 await page.getByRole("button",{name:"Chọn cách xuất"}).click();
 const event=page.waitForEvent("download");
 await page.getByRole("button",{name:"Tải Word"}).click();
 const dl=await event;
 expect(dl.suggestedFilename()).toMatch(/Kế hoạch khảo sát\.docx$/);
 const archive=await JSZip.loadAsync(await readFile(await dl.path()));
 expect(await archive.file("word/document.xml")!.async("string")).toContain("Di sản địa phương");
});
test("PDF text file imports correctly",async({page})=>{
 await page.goto("/");
 await page.locator("#sourceUpload").setInputFiles(pdfFixture);
 await expect(page.getByText("sample-text.pdf").first()).toBeVisible();
 await page.getByRole("button",{name:"Kiểm tra nội dung"}).click();
 await expect(page.getByRole("textbox",{name:/Nội dung kế hoạch/}))
  .toHaveValue(/EduPlan PDF Demo 2026/);
});
test("custom DOCX template fills placeholders across split Word runs",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:/Tạo kế hoạch mới từ đầu/}).click();
 await page.getByRole("textbox",{name:"Tên kế hoạch"}).fill("Hoạt động 2026");
 await page.getByRole("textbox",{name:"Trường"}).fill("THCS Hòa Hiệp");
 await page.getByRole("textbox",{name:/Nội dung kế hoạch/}).fill("Nội dung thử nghiệm");
 await page.getByRole("button",{name:"Chọn cách xuất"}).click();
 await page.getByRole("radio",{name:/Word theo mẫu của tôi/}).check();
 await page.locator("#templateUpload").setInputFiles(docxFixture);
 const event=page.waitForEvent("download");
 await page.getByRole("button",{name:"Tải Word"}).click();
 const dl=await event;
 expect(dl.suggestedFilename()).toContain("theo-mau");
 const archive=await JSZip.loadAsync(await readFile(await dl.path()));
 const xml=await archive.file("word/document.xml")!.async("string");
 expect(xml).toContain("Hoạt động 2026");
 expect(xml).toContain("Nội dung thử nghiệm");
 expect(xml).not.toContain("{{tit");
});
test("installed PWA can reopen core editor offline after the first load",async({page,context})=>{
 await page.goto("/");
 await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:20_000});
 await page.reload();
 await expect(page.getByRole("heading",{name:/Soạn kế hoạch giáo dục/})).toBeVisible();
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByRole("button",{name:/Tạo kế hoạch mới từ đầu/})).toBeVisible();
 await context.setOffline(false);
});
