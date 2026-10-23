import JSZip from "jszip";
import readXlsxFile from "read-excel-file/browser";
import {AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun} from "docx";

export const MAX_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_LINES = 5000;
export const MAX_CONTENT_CHARS = 180_000;
export const ACCEPT = ".docx,.xlsx,.csv,.txt,.md,.pdf";
export type FieldKey = "school" | "subject" | "grade" | "teacher" | "title" | "content";
export type Fields = Record<FieldKey, string>;
export type SourceDoc = {id:string;name:string;kind:string;lines:string[];warnings?:string[]};
export const initialFields: Fields = {school:"",subject:"",grade:"",teacher:"",title:"",content:""};
export const fieldLabels:Record<FieldKey,string> = {
 school:"Trường",subject:"Môn học",grade:"Khối/lớp",teacher:"Giáo viên",title:"Tên kế hoạch",content:"Nội dung",
};
const placeholderNames:FieldKey[] = ["school","subject","grade","teacher","title","content"];
export function decodeEntities(value:string):string {
 return value.replace(/&#x([0-9a-f]+);|&#([0-9]+);|&(amp|lt|gt|quot|apos);/gi,
 (whole,hex:string|undefined,dec:string|undefined,entity:string|undefined)=>{
  if(hex||dec){const cp=parseInt(hex||dec||"",hex?16:10);
   return cp>0&&cp<=0x10ffff&&!(cp>=0xd800&&cp<=0xdfff)?String.fromCodePoint(cp):"";}
  return ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'"} as Record<string,string>)[entity||""]||whole;
 });
}
export function xmlEscape(value:string):string {
 return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
export function normalizeLines(value:string):string[]{
 return value.replace(/^\uFEFF/,"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,MAX_LINES);
}
export function xmlToText(xml:string):string {
 return decodeEntities(xml.replace(/<w:tab\b[^>]*\/>/gi,"\t")
  .replace(/<w:br\b[^>]*\/>/gi,"\n").replace(/<\/w:tc\s*>/gi,"\t")
  .replace(/<\/w:tr\s*>/gi,"\n").replace(/<\/w:p\s*>/gi,"\n").replace(/<[^>]*>/g,""));
}
export function parseCsv(text:string):string[][] {
 const sample=text.replace(/^\uFEFF/,"").split(/\r?\n/,1)[0]||"";
 const sep=["\t",";",","].sort((a,b)=>sample.split(b).length-sample.split(a).length)[0];
 const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;
 const input=text.replace(/^\uFEFF/,"");
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===sep&&!quoted){row.push(cell.trim());cell="";}
  else if((c==="\r"||c==="\n")&&!quoted){
   if(c==="\r"&&input[i+1]==="\n")i++;
   row.push(cell.trim());if(row.some(Boolean))rows.push(row);
   if(rows.length>=MAX_LINES)break;row=[];cell="";
  }else cell+=c;
 }
 if(row.length||cell.trim()){row.push(cell.trim());if(row.some(Boolean)&&rows.length<MAX_LINES)rows.push(row);}
 return rows;
}
function cellToString(cell:unknown):string {
 if(cell==null)return "";
 if(cell instanceof Date)return cell.toLocaleDateString("vi-VN");
 if(typeof cell==="object")return JSON.stringify(cell);
 return String(cell);
}
async function parsePdf(file:File):Promise<string[]> {
 const pdfjs=await import("pdfjs-dist");
 pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true});
 try{
  const pdf=await task.promise;
  if(pdf.numPages>100)throw new Error("PDF có hơn 100 trang; hãy chia thành tài liệu nhỏ.");
  const pages:string[]=[];
  for(let i=1;i<=pdf.numPages;i++){
   const page=await pdf.getPage(i), content=await page.getTextContent();
   let line="",text="";
   for(const item of content.items){
    if(!("str" in item))continue;
    line+=item.str+" ";
    if(item.hasEOL){text+=line.trim()+"\n";line="";}
   }
   text+=line.trim();
   if(text.trim())pages.push("Trang "+i+"\n"+text.trim());
   page.cleanup();
  }
  if(!pages.length)throw new Error("PDF không có lớp văn bản. PDF scan/ảnh cần OCR, chưa hỗ trợ trong phiên bản này.");
  return normalizeLines(pages.join("\n"));
 }finally{await task.destroy();}
}
export async function parseDocument(file:File):Promise<SourceDoc>{
 const ext=file.name.split(".").pop()?.toLowerCase()||"";
 if(!file.size)throw new Error("Tệp đang rỗng.");
 if(file.size>MAX_FILE_BYTES)throw new Error("Tệp vượt quá giới hạn 12 MB.");
 let lines:string[]=[];const warnings:string[]=[];
 if(ext==="txt"||ext==="md")lines=normalizeLines(await file.text());
 else if(ext==="csv")lines=normalizeLines(parseCsv(await file.text()).map(row=>row.join(" | ")).join("\n"));
 else if(ext==="docx"){
  const archive=await JSZip.loadAsync(await file.arrayBuffer()), entry=archive.file("word/document.xml");
  if(!entry)throw new Error("Word không hợp lệ hoặc bị hỏng.");
  const xml=await entry.async("string");if(xml.length>25_000_000)throw new Error("Tài liệu Word quá dài.");
  lines=normalizeLines(xmlToText(xml));
 }else if(ext==="xlsx"){
  const sheets=await readXlsxFile(file),output:string[]=[];
  for(const sheet of sheets){output.push("Bảng: "+sheet.sheet);for(const row of sheet.data)output.push(row.map(cellToString).join(" | "));}
  lines=normalizeLines(output.join("\n"));
 }else if(ext==="pdf")lines=await parsePdf(file);
 else throw new Error("Định dạng chưa hỗ trợ. Chọn DOCX, XLSX, CSV, TXT, MD hoặc PDF có văn bản.");
 if(!lines.length)throw new Error("Không tìm thấy nội dung có thể đọc.");
 if(lines.length===MAX_LINES)warnings.push("Tài liệu quá dài: chỉ lấy 5.000 dòng đầu.");
 return {id:[file.name,file.size,file.lastModified].join(":"),name:file.name,kind:ext,lines,warnings};
}
export function suggestFields(docs:SourceDoc[]):Partial<Fields>{
 const all=docs.flatMap(d=>d.lines).join("\n");
 const pick=(...rs:RegExp[])=>rs.map(r=>all.match(r)?.[1]?.trim()).find(Boolean)||"";
 return {
  school:pick(/(?:^|\n)(?:Trường|Đơn vị)\s*:\s*([^\n]+)/i),
  subject:pick(/(?:^|\n)(?:Môn học|Môn)\s*:\s*([^\n]+)/i),
  grade:pick(/(?:^|\n)(?:Khối|Lớp)\s*:\s*([^\n]+)/i),
  teacher:pick(/(?:^|\n)(?:Giáo viên|Người dạy)\s*:\s*([^\n]+)/i),
  title:pick(/(?:^|\n)(?:Tên bài|Tên kế hoạch|Chủ đề)\s*:\s*([^\n]+)/i),
 };
}
export function combineSources(docs:SourceDoc[]):{content:string;truncated:boolean}{
 const value=docs.map(doc=>"TÀI LIỆU: "+doc.name+"\n"+doc.lines.join("\n")).join("\n\n");
 return {content:value.slice(0,MAX_CONTENT_CHARS),truncated:value.length>MAX_CONTENT_CHARS};
}
export function downloadBlob(blob:Blob,filename:string):void{
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),5000);
}
export function safeFilename(name:string):string{
 return name.replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g," ").trim().slice(0,64)||"Ke-hoach";
}
export async function createStandardDocx(fields:Fields):Promise<Blob>{
 const doc=new Document({
  styles:{default:{document:{run:{font:"Times New Roman",size:26},paragraph:{spacing:{after:0,line:320}}}}},
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1701,right:1134}}},children:[
   new Paragraph({text:fields.school||"Đơn vị",heading:HeadingLevel.HEADING_2}),
   new Paragraph({text:fields.title||"KẾ HOẠCH GIÁO DỤC",heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER}),
   ...(["subject","grade","teacher"] as FieldKey[]).map(key=>new Paragraph({children:[
    new TextRun({text:fieldLabels[key]+": ",bold:true}),new TextRun(fields[key])]})),
   new Paragraph({text:"NỘI DUNG",heading:HeadingLevel.HEADING_2}),
   ...fields.content.replace(/\r\n/g,"\n").split("\n").map(line=>new Paragraph({text:line||" "})),
  ]}]});
 return Packer.toBlob(doc);
}
export async function exportStandard(fields:Fields):Promise<void>{
 downloadBlob(await createStandardDocx(fields),safeFilename(fields.title)+".docx");
}
export async function createSampleTemplateDocx():Promise<Blob>{
 const doc=new Document({sections:[{children:[
  new Paragraph({text:"{{school}}",heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:"{{title}}",heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER}),
  new Paragraph({text:"Môn học: {{subject}}"}),
  new Paragraph({text:"Lớp: {{grade}}"}),
  new Paragraph({text:"Giáo viên: {{teacher}}"}),
  new Paragraph({text:"Nội dung:",heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:"{{content}}"}),
 ]}]});
 return Packer.toBlob(doc);
}
export type TemplateResult={replaced:number;missing:string[]};
/** Preserve DOCX OOXML paragraph/run structure while filling tokens even across split text runs. */
export function fillWordDocumentXml(xml:string,fields:Fields):{xml:string;result:TemplateResult}{
 const found=new Set<FieldKey>();
 const filled=xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,block=>{
  const regex=/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g, spans=[...block.matchAll(regex)];
  if(!spans.length)return block;
  const chunks=spans.map(m=>decodeEntities(m[1])),starts:number[]=[];
  let len=0;for(const chunk of chunks){starts.push(len);len+=chunk.length;}
  const whole=chunks.join("");
  const edits:Array<Array<{from:number;to:number;value:string}>>=chunks.map(()=>[]);
  for(const match of whole.matchAll(/\{\{(school|subject|grade|teacher|title|content)\}\}/g)){
   const key=match[1] as FieldKey;found.add(key);
   const a=match.index,b=a+match[0].length;let inserted=false;
   for(let i=0;i<chunks.length;i++){
    const start=Math.max(a,starts[i]),end=Math.min(b,starts[i]+chunks[i].length);
    if(start>=end)continue;
    edits[i].push({from:start-starts[i],to:end-starts[i],value:inserted?"":fields[key]});
    inserted=true;
   }
  }
  let idx=0;
  return block.replace(regex,tag=>{
   let txt=chunks[idx];for(const e of edits[idx].sort((a,b)=>b.from-a.from)){
    txt=txt.slice(0,e.from)+e.value+txt.slice(e.to);
   }idx++;
   const enc=xmlEscape(txt).replace(/\r?\n/g,"</w:t><w:br/><w:t>");
   return tag.slice(0,tag.indexOf(">")+1)+enc+tag.slice(tag.lastIndexOf("</w:t>"));
  });
 });
 return {xml:filled,result:{replaced:found.size,missing:placeholderNames.filter(k=>!found.has(k))}};
}
export async function createTemplateDocx(template:File,fields:Fields):Promise<TemplateResult&{blob:Blob}>{
 if(!template.name.toLowerCase().endsWith(".docx"))throw new Error("Mẫu cần là tệp Word .docx.");
 if(!template.size||template.size>MAX_FILE_BYTES)throw new Error("Mẫu rỗng hoặc vượt quá 12 MB.");
 const archive=await JSZip.loadAsync(await template.arrayBuffer()),part=archive.file("word/document.xml");
 if(!part)throw new Error("Mẫu Word không hợp lệ.");
 const xml=await part.async("string");if(xml.length>25_000_000)throw new Error("Mẫu Word quá dài.");
 const {xml:filled,result}=fillWordDocumentXml(xml,fields);
 if(!result.replaced)throw new Error("Không thấy thẻ điền dữ liệu trong mẫu. Hãy tải mẫu tham khảo của EduPlan.");
 archive.file("word/document.xml",filled);
 const blob=await archive.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
 return {...result,blob};
}
export async function exportFromTemplate(template:File,fields:Fields):Promise<TemplateResult>{
 const {blob,replaced,missing}=await createTemplateDocx(template,fields);
 downloadBlob(blob,safeFilename(fields.title)+"-theo-mau.docx");
 return {replaced,missing};
}
