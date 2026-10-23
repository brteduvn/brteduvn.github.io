import {describe,it,expect} from "vitest";
import JSZip from "jszip";
import {normalizeLines,suggestFields,xmlEscape,xmlToText,parseDocument,parseCsv,combineSources,fillWordDocumentXml,createSampleTemplateDocx,createStandardDocx,createTemplateDocx,initialFields,type SourceDoc} from "../src/lib/document";

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
  await expect(parseDocument(new File(["x"],"sample.jpg"))).rejects.toThrow("Định dạng");
  await expect(parseDocument(new File([new Uint8Array(12*1024*1024+1)],"large.txt"))).rejects.toThrow("12 MB");
 });
 it("rejects custom templates without a recognized field",async()=>{
  const zip=new JSZip();zip.file("word/document.xml","<w:document><w:t>No tokens</w:t></w:document>");
  const file=new File([await zip.generateAsync({type:"uint8array"})],"empty.docx");
  await expect(createTemplateDocx(file,initialFields)).rejects.toThrow("thẻ điền dữ liệu");
 });

 it("reads quoted CSV with semicolon delimiters",()=>{
  expect(parseCsv('Tuần;Nội dung\r\n1;"Di sản; địa phương"\r\n2;"Dòng 1\nDòng 2"')).toEqual([
   ["Tuần","Nội dung"],["1","Di sản; địa phương"],["2","Dòng 1\nDòng 2"]
  ]);
 });
 it("replaces Word placeholders split across formatted runs",()=>{
  const xml='<w:document><w:p><w:r><w:t>Mẫu {{tit</w:t></w:r><w:r><w:t>le}} của</w:t></w:r><w:r><w:t> trường</w:t></w:r></w:p></w:document>';
  const result=fillWordDocumentXml(xml,{...initialFields,title:"GDĐP & Lịch sử"});
  expect(result.result.replaced).toBe(1);
  expect(result.xml).toContain("GDĐP &amp; Lịch sử");
  expect(result.xml).not.toContain("{{tit");
  expect(result.xml).toContain(" của");
  expect(result.xml).toContain(" trường");
 });
 it("replaces adjacent tokens without deleting surrounding text",()=>{
  const xml='<w:p><w:r><w:t>{{school}} — {{title}}</w:t></w:r></w:p>';
  const result=fillWordDocumentXml(xml,{...initialFields,school:"Trường A",title:"Kế hoạch 2026"});
  expect(result.result.replaced).toBe(2);
  expect(result.xml).toContain("Trường A — Kế hoạch 2026");
 });
 it("maps multiple content lines to OOXML breaks",()=>{
  const xml='<w:p><w:r><w:t>{{content}}</w:t></w:r></w:p>';
  expect(fillWordDocumentXml(xml,{...initialFields,content:"Tiết 1\nTiết 2"}).xml)
   .toContain("Tiết 1</w:t><w:br/><w:t>Tiết 2");
 });
 it("exports editable A4 Word with Times New Roman 13pt",async()=>{
  const b=await createStandardDocx({...initialFields,title:"Mẫu A4",content:"Tiết 1"});
  const archive=await JSZip.loadAsync(await b.arrayBuffer());
  const body=await archive.file("word/document.xml")!.async("string");
  const styles=await archive.file("word/styles.xml")!.async("string");
  expect(body).toContain("11906");
  expect(body).toContain("16838");
  expect(styles).toContain("Times New Roman");
  expect(styles).toContain("26");
 });
 it("produces a working sample DOCX template",async()=>{
  const sample=await createSampleTemplateDocx();
  const result=await createTemplateDocx(new File([sample],"mau.docx"),
   {...initialFields,title:"Khảo sát địa phương",content:"Hoạt động 1"});
  expect(result.replaced).toBeGreaterThanOrEqual(2);
  const archive=await JSZip.loadAsync(await result.blob.arrayBuffer());
  const xml=await archive.file("word/document.xml")!.async("string");
  expect(xml).toContain("Khảo sát địa phương");
  expect(xml).toContain("Hoạt động 1");
 });
 it("combines files while retaining source names",()=>{
  const docs:SourceDoc[]=[{id:"A",name:"Tuan-1.txt",kind:"txt",lines:["Tiết 1","Tiết 2"]}];
  expect(combineSources(docs).content).toContain("TÀI LIỆU: Tuan-1.txt");
  expect(combineSources(docs).content).toContain("Tiết 2");
 });
});
