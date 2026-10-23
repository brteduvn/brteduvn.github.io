import JSZip from "jszip";
import readExcelFile from "read-excel-file/browser";
import {Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType} from "docx";

export type SourceDoc = {id:string;name:string;kind:string;lines:string[]};
export type FieldKey = "school"|"subject"|"grade"|"teacher"|"title"|"content";
export type Fields = Record<FieldKey,string>;
export const initialFields:Fields={school:"",subject:"",grade:"",teacher:"",title:"",content:""};
export const fieldLabels:Record<FieldKey,string>={school:"Trường",subject:"Môn học",grade:"Khối/lớp",teacher:"Giáo viên",title:"Tên kế hoạch",content:"Nội dung"};
export const ACCEPT=".docx,.xlsx,.csv,.txt,.md";
const limit=12*1024*1024;
function decodeEntities(text:string):string {
 return text.replace(/&#x([0-9a-f]+);|&#([0-9]+);|&(amp|lt|gt|quot|apos);/gi,(_full,hex:string,decimal:string,named:string)=>{
  if(hex||decimal) {const n=parseInt(hex||decimal,hex?16:10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):"";}
  return ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'"} as Record<string,string>)[named]??_full;
 });
}
export function xmlToText(xml:string):string {
 // Text content is extracted from OOXML paragraphs/cells in document order.
 return decodeEntities(xml.replace(/<w:tab\b[^>]*\/>/g,"\t").replace(/<w:br\b[^>]*\/>/g,"\n")
  .replace(/<\/w:p>/g,"\n").replace(/<\/w:tr>/g,"\n").replace(/<\/w:tc>/g,"\t")
  .replace(/<[^>]*>/g,""));
}
export function normalizeLines(s:string):string[]{return s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,3000);}
function showCell(cell:unknown):string {
 if(cell==null)return "";
 if(typeof cell==="object"){
  if("text" in cell && typeof cell.text==="string")return cell.text;
  if("result" in cell)return String(cell.result??"");
  if("richText" in cell && Array.isArray(cell.richText))return cell.richText.map((item:{text?:string})=>item.text||"").join("");
  return JSON.stringify(cell);
 }
 return String(cell);
}
export async function parseDocument(file:File):Promise<SourceDoc> {
 const ext=file.name.split(".").pop()?.toLowerCase()??"";
 if(file.size>limit)throw new Error("Tệp vượt quá giới hạn 12 MB.");
 let lines:string[]=[];
 if(["txt","md","csv"].includes(ext)){lines=normalizeLines(await file.text());}
 else if(ext==="docx"){
  const archive=await JSZip.loadAsync(await file.arrayBuffer());
  const member=archive.file("word/document.xml");if(!member)throw new Error("Tệp DOCX không hợp lệ.");
  const xml=await member.async("string");if(xml.length>20_000_000)throw new Error("Tài liệu quá dài.");
  lines=normalizeLines(xmlToText(xml));
 } else if(ext==="xlsx"){
  const workbook=await readExcelFile(file);
  const rows:string[]=[];
  for(const sheet of workbook){
   rows.push("Bảng: "+sheet.sheet);
   for(const row of sheet.data)rows.push(row.map(showCell).join(" | "));
  }
  lines=normalizeLines(rows.join("\n"));
 } else throw new Error("Định dạng chưa hỗ trợ. Dùng DOCX, XLSX, CSV, TXT hoặc MD.");
 if(!lines.length)throw new Error("Không tìm thấy nội dung đọc được.");
 return {id:[file.name,file.size,file.lastModified].join(":"),name:file.name,kind:ext,lines};
}
export function suggestFields(docs:SourceDoc[]):Partial<Fields>{
 const text=docs.flatMap(d=>d.lines).join("\n");
 const get=(...regex:RegExp[])=>regex.map(r=>text.match(r)?.[1]?.trim()).find(Boolean)||"";
 return {school:get(/(?:Trường|Đơn vị)\s*:\s*([^\n]+)/i),subject:get(/(?:Môn học|Môn)\s*:\s*([^\n]+)/i),
  grade:get(/(?:Khối|Lớp)\s*:\s*([^\n]+)/i),teacher:get(/(?:Giáo viên|Người dạy)\s*:\s*([^\n]+)/i),
  title:get(/(?:Tên bài|Tên kế hoạch|Chủ đề)\s*:\s*([^\n]+)/i)};
}
export function xmlEscape(s:string){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function safeName(name:string){return name.replace(/[\\/:*?"<>|]/g,"-").trim().slice(0,64)||"Ke-hoach";}
export function downloadBlob(blob:Blob,filename:string){
 const url=URL.createObjectURL(blob);const link=document.createElement("a");
 link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),5000);
}
export async function createStandardDocx(fields:Fields):Promise<Blob>{
 const lines=normalizeLines(fields.content);
 const doc=new Document({sections:[{properties:{},children:[
  new Paragraph({text:fields.school||"Đơn vị",heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:fields.title||"KẾ HOẠCH",heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER}),
  ...(["subject","grade","teacher"] as FieldKey[]).map(key=>new Paragraph({children:[
   new TextRun({text:fieldLabels[key]+": ",bold:true}),new TextRun(fields[key]||"Chưa điền")]})),
  new Paragraph({text:"NỘI DUNG",heading:HeadingLevel.HEADING_2}),
  ...(lines.length?lines:["Chưa có nội dung"]).map(text=>new Paragraph({text}))
 ]}]});
 return await Packer.toBlob(doc);
}
export async function exportStandard(fields:Fields):Promise<void>{
 downloadBlob(await createStandardDocx(fields),safeName(fields.title)+".docx");
}
/** Downloadable template with editable placeholders in one text run. */
export async function createSampleTemplateDocx():Promise<Blob>{
 const doc=new Document({sections:[{children:[
  new Paragraph({text:"{{school}}",heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:"{{title}}",heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER}),
  new Paragraph({text:"Môn học: {{subject}}"}),
  new Paragraph({text:"Lớp: {{grade}}"}),
  new Paragraph({text:"Giáo viên: {{teacher}}"}),
  new Paragraph({text:"Nội dung:",heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:"{{content}}"})
 ]}]});
 return await Packer.toBlob(doc);
}
export type TemplateResult={replaced:number;missing:string[]};
export async function createTemplateDocx(template:File,fields:Fields):Promise<TemplateResult&{blob:Blob}>{
 if(!template.name.toLowerCase().endsWith(".docx"))throw new Error("Mẫu xuất phải là DOCX.");
 if(template.size>limit)throw new Error("Mẫu Word vượt quá 12 MB.");
 const archive=await JSZip.loadAsync(await template.arrayBuffer());
 const part=archive.file("word/document.xml");if(!part)throw new Error("File mẫu DOCX không hợp lệ.");
 let xml=await part.async("string");if(xml.length>20_000_000)throw new Error("Mẫu Word quá dài.");
 let replaced=0;const missing:string[]=[];
 for(const key of Object.keys(fields) as FieldKey[]){
  const token="{{"+key+"}}";
  if(!xml.includes(token)){missing.push(key);continue;}
  // Version 0.1 supports whole placeholders in one Word text run.
  xml=xml.split(token).join(xmlEscape(fields[key]));replaced++;
 }
 if(!replaced)throw new Error("Mẫu chưa có thẻ dữ liệu. Hãy thêm {{title}} hoặc {{content}} vào mẫu Word.");
 archive.file("word/document.xml",xml);
 const blob=await archive.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
 return {replaced,missing,blob};
}
export async function exportFromTemplate(template:File,fields:Fields):Promise<TemplateResult>{
 const {blob,replaced,missing}=await createTemplateDocx(template,fields);
 downloadBlob(blob,safeName(fields.title)+"-theo-mau.docx");
 return {replaced,missing};
}