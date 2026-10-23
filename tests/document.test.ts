import {describe,it,expect} from "vitest";
import JSZip from "jszip";
import {normalizeLines,suggestFields,xmlEscape,xmlToText,parseDocument,createStandardDocx,createTemplateDocx,initialFields,type SourceDoc} from "../src/lib/document";

describe("document processing",()=>{
 it("normalizes Windows and Unix lines",()=>expect(normalizeLines(" A\r\n\n B \n")).toEqual(["A","B"]));
 it("escapes XML metacharacters",()=>expect(xmlEscape('<Tom & "Mai">')).toBe("&lt;Tom &amp; &quot;Mai&quot;&gt;"));
 it("extracts DOCX paragraphs and entities",()=>expect(xmlToText("<w:p><w:r><w:t>A&amp;B</w:t></w:r></w:p>")).toContain("A&B"));
 it("suggests education metadata",()=>{
  const data:SourceDoc[]=[{id:"a",name:"lesson.txt",kind:"txt",lines:["Trường: THCS A","Môn học: GDĐP","Lớp: 6"]}];
  expect(suggestFields(data)).toMatchObject({school:"THCS A",subject:"GDĐP",grade:"6"});
 });
 it("parses and identifies content from a real generated DOCX",async()=>{
  const blob=await createStandardDocx({...initialFields,school:"THCS Bình Minh",subject:"GDĐP",title:"Kế hoạch mẫu",content:"Tiết 1: Di sản"});
  const file=new File([blob],"test-plan.docx",{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
  const parsed=await parseDocument(file);
  expect(parsed.lines.join(" ")).toContain("Di sản");
  expect(parsed.lines.join(" ")).toContain("GDĐP");
 });
 it("fills a custom DOCX without changing surrounding OOXML",async()=>{
  const zip=new JSZip();
  zip.file("word/document.xml",'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{title}}</w:t></w:r></w:p><w:p><w:r><w:t>Giữ nguyên</w:t></w:r></w:p></w:body></w:document>');
  const file=new File([await zip.generateAsync({type:"uint8array"})],"template.docx");
  const result=await createTemplateDocx(file,{...initialFields,title:"GDĐP & Lịch sử"});
  expect(result.replaced).toBe(1);
  const filled=await JSZip.loadAsync(await result.blob.arrayBuffer());
  const text=await filled.file("word/document.xml")!.async("string");
  expect(text).toContain("GDĐP &amp; Lịch sử");
  expect(text).toContain("Giữ nguyên");
 });
 it("imports an actual XLSX worksheet",async()=>{
  const x=new JSZip();
  x.file("[Content_Types].xml",'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  x.file("_rels/.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  x.file("xl/workbook.xml",'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="PPCT" sheetId="1" r:id="rId1"/></sheets></workbook>');
  x.file("xl/_rels/workbook.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  x.file("xl/worksheets/sheet1.xml",'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Tuần</t></is></c><c r="B1" t="inlineStr"><is><t>Bài học</t></is></c></row><row r="2"><c r="A2"><v>1</v></c><c r="B2" t="inlineStr"><is><t>Địa phương</t></is></c></row></sheetData></worksheet>');
  const file=new File([await x.generateAsync({type:"uint8array"})],"ppct.xlsx");
  const parsed=await parseDocument(file);
  expect(parsed.lines.join(" ")).toContain("PPCT");
  expect(parsed.lines.join(" ")).toContain("Địa phương");
 });
 it("rejects unsupported and oversized input",async()=>{
  await expect(parseDocument(new File(["x"],"sample.pdf"))).rejects.toThrow("Định dạng");
  await expect(parseDocument(new File([new Uint8Array(12*1024*1024+1)],"large.txt"))).rejects.toThrow("12 MB");
 });
 it("rejects custom templates without a recognized field",async()=>{
  const zip=new JSZip();zip.file("word/document.xml","<w:document><w:t>No tokens</w:t></w:document>");
  const file=new File([await zip.generateAsync({type:"uint8array"})],"empty.docx");
  await expect(createTemplateDocx(file,initialFields)).rejects.toThrow("thẻ dữ liệu");
 });
});
