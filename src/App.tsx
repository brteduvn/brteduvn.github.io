import {useEffect,useState,type ChangeEvent,type DragEvent} from "react";
import {
 ArrowLeft,ArrowRight,BookOpen,Check,CheckCircle2,ChevronDown,CloudOff,
 Download,FileCheck2,FilePlus2,FileText,FileUp,GraduationCap,HardDriveDownload,
 Info,LockKeyhole,Printer,RefreshCcw,Save,ShieldCheck,UploadCloud,X
} from "lucide-react";
import {
 ACCEPT,MAX_CONTENT_CHARS,combineSources,createSampleTemplateDocx,downloadBlob,
 exportFromTemplate,exportStandard,fieldLabels,initialFields,parseDocument,
 suggestFields,type FieldKey,type Fields,type SourceDoc
} from "./lib/document";
import {clearDraft,readDraft,saveDraft} from "./lib/draft";

type Stage = 1|2|3;
type Mode = "standard"|"custom";
const repo = "https://github.com/brteduvn/brteduvn.github.io";
const stageNames = ["Chọn tài liệu","Kiểm tra nội dung","Xuất kết quả"];
export default function App(){
 const [initial] = useState(()=>readDraft());
 const [stage,setStage] = useState<Stage>(initial?.stage||1);
 const [docs,setDocs] = useState<SourceDoc[]>(initial?.docs||[]);
 const [fields,setFields] = useState<Fields>(initial?.fields||initialFields);
 const [mode,setMode] = useState<Mode>("standard");
 const [template,setTemplate] = useState<File|null>(null);
 const [working,setWorking] = useState(false);
 const [error,setError] = useState("");
 const [notice,setNotice] = useState("");
 const [saveStatus,setSaveStatus] = useState(initial?"Đã khôi phục bản nháp":"Chỉ lưu trên thiết bị");
 const [showSources,setShowSources] = useState(false);
 const [showHelp,setShowHelp] = useState(false);
 const [dragOver,setDragOver] = useState(false);

 const hasContent = Boolean(docs.length||Object.values(fields).some(value=>value.trim()));
 useEffect(()=>{
  if(!hasContent) return;
  setSaveStatus("Đang lưu...");
  const timer=window.setTimeout(()=>{
   const saved=saveDraft({version:1,fields,docs,stage,savedAt:new Date().toISOString()});
   setSaveStatus(saved?"Đã tự lưu trên thiết bị":"Bộ nhớ trình duyệt không đủ, hãy xuất Word");
  },700);
  return ()=>window.clearTimeout(timer);
 },[docs,fields,stage,hasContent]);

 function changeField(key:FieldKey,value:string){setFields(prev=>({...prev,[key]:value}));}
 async function loadFiles(fileList:FileList|File[]){
  const files=Array.from(fileList);
  if(!files.length)return;
  setError("");setNotice("");setWorking(true);
  const passed:SourceDoc[]=[],failed:string[]=[];
  for(const file of files){
   try{passed.push(await parseDocument(file));}
   catch(e){failed.push(file.name+": "+(e instanceof Error?e.message:"Không đọc được tệp"));}
  }
  if(passed.length){
   const existing=new Set(docs.map(d=>d.id));
   const fresh=passed.filter(doc=>!existing.has(doc.id));
   const joined=combineSources(fresh);
   if(joined.truncated)failed.push("Tài liệu quá dài: đã giới hạn nội dung được nhập.");
   if(fresh.length){
    setDocs(old=>[...old,...fresh].slice(0,30));
    setFields(current=>{
     const inferred=suggestFields(fresh);
     const values={...current};
     (Object.keys(inferred) as FieldKey[]).forEach(key=>{if(!values[key]&&inferred[key])values[key]=inferred[key]||"";});
     values.content=(values.content ? values.content+"\n\n" : "")+joined.content;
     if(values.content.length>MAX_CONTENT_CHARS){
      values.content=values.content.slice(0,MAX_CONTENT_CHARS);
      // The editor keeps an explicit maximum to prevent browser freezes.
     }

     return values;
    });
   }else setNotice("Các tài liệu này đã được thêm.");
  }
  if(failed.length)setError(failed.join("\n"));
  if(passed.length)setNotice("Đã đọc "+passed.length+" tài liệu. Có thể thêm file khác hoặc tiếp tục.");
  setWorking(false);
 }
 function onFileInput(e:ChangeEvent<HTMLInputElement>){
  const files=e.target.files;if(files)void loadFiles(files);e.target.value="";
 }
 function onDrop(e:DragEvent<HTMLElement>){
  e.preventDefault();setDragOver(false);if(e.dataTransfer.files.length)void loadFiles(e.dataTransfer.files);
 }
 function reset(){
  if(hasContent&&!window.confirm("Xóa bản nháp đang lưu trên thiết bị và bắt đầu lại?"))return;
  clearDraft();setStage(1);setDocs([]);setFields({...initialFields});setTemplate(null);
  setMode("standard");setError("");setNotice("");setSaveStatus("Bản nháp đã xóa");
 }
 function removeDoc(id:string){
  const next=docs.filter(d=>d.id!==id);
  setDocs(next);
  setNotice("Đã bỏ file khỏi danh sách. Nội dung đã nhập vẫn ở bước chỉnh sửa để tránh mất dữ liệu.");
 }
 function startBlank(){
  setFields(current=>({...current,title:current.title||"Kế hoạch giáo dục"}));
  setStage(2);setError("");setNotice("");
 }
 async function getSample(){
  setError("");
  try{downloadBlob(await createSampleTemplateDocx(),"eduplan-mau-tham-khao.docx");}
  catch{setError("Không thể tạo mẫu Word. Hãy thử lại.");}
 }
 async function exportDocument(){
  if(!fields.content.trim()){setError("Hãy thêm nội dung kế hoạch trước khi xuất.");return;}
  setError("");setNotice("");setWorking(true);
  try{
   if(mode==="custom"){
    if(!template)throw new Error("Hãy chọn tệp mẫu Word .docx của trường.");
    const result=await exportFromTemplate(template,fields);
    setNotice("Đã tạo Word theo mẫu, điền "+result.replaced+" trường. Hãy mở file tải về để kiểm tra.");
   }else{
    await exportStandard(fields);
    setNotice("Đã tạo file Word A4. Bạn có thể mở và chỉnh sửa tiếp trong Word.");
   }
  }catch(e){setError(e instanceof Error?e.message:"Chưa thể xuất tài liệu.");}
  finally{setWorking(false);}
 }
 return <div className="site">
  <header className="header">
   <div className="headerInner">
    <button className="logo" type="button" onClick={reset} aria-label="EduPlan — trang đầu">
     <span className="logoMark"><GraduationCap size={22} strokeWidth={2.25}/></span>
     <span>EduPlan<span className="logoOSS">OSS</span></span>
    </button>
    <nav className="headerLinks" aria-label="Liên kết">
     <span className="freeTag"><CheckCircle2 size={14}/> Miễn phí cho giáo viên</span>
     <a href={repo} target="_blank" rel="noopener noreferrer" aria-label="Mở GitHub EduPlan OSS">Mã nguồn ↗</a>
    </nav>
   </div>
  </header>

  <main className="main">
   <div className="hero">
    <div className="eyebrow"><span className="pulse"/> CÔNG CỤ GIÁO DỤC MỞ · VIỆT NAM</div>
    <h1>Soạn kế hoạch giáo dục.<br/><span>Nhẹ nhàng hơn mỗi ngày.</span></h1>
    <p>Nhập tài liệu có sẵn hoặc tạo từ đầu. Chỉ vài bước là có file Word để sử dụng.</p>
    <div className="heroTrust"><span><LockKeyhole size={15}/> Không cần tài khoản</span><span><CloudOff size={15}/> Tài liệu xử lý trên thiết bị</span><span><Check size={15}/> Miễn phí</span></div>
   </div>
   <nav className="steps" aria-label="Các bước tạo tài liệu">
    {stageNames.map((name,i)=><div key={name} className={"step "+(stage===i+1?"current":stage>i+1?"complete":"")}>
     <span className="stepNum">{stage>i+1?<Check size={15}/>:i+1}</span>
     <span>{name}</span>
    </div>)}
   </nav>
   <section className="workspace" aria-label="Trình soạn kế hoạch">
    {stage===1&&<>
     <div className="sectionTitle"><span className="sectionIcon"><FileUp size={21}/></span><div><h2>Bạn đã có tài liệu chưa?</h2><p>Thả file vào đây, EduPlan sẽ đọc nội dung giúp bạn.</p></div></div>
     <div className={"dropzone "+(dragOver?"dragging":"")} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={e=>{e.preventDefault();setDragOver(false);}} onDrop={onDrop}>
      <label htmlFor="sourceUpload" className="filePicker">
       <span className="uploadCircle"><UploadCloud size={28}/></span>
       <strong>{working?"Đang đọc tài liệu...":"Chọn file hoặc kéo thả vào đây"}</strong>
       <span className="fileFormats">Word, Excel, PDF có văn bản, CSV, TXT, MD</span>
       <span className="uploadLimit">Có thể chọn nhiều file · Tối đa 12 MB mỗi file</span>
       <input id="sourceUpload" type="file" accept={ACCEPT} multiple disabled={working} onChange={onFileInput}/>
      </label>
     </div>
     {docs.length>0&&<div className="fileGroup">
      <div className="fileGroupHead"><b>Đã thêm {docs.length} tài liệu</b><small>Chỉ xử lý trên trình duyệt</small></div>
      {docs.map(doc=><div key={doc.id} className="fileRow"><FileText size={18}/><span className="fileName">{doc.name}<small>{doc.lines.length} dòng · {doc.kind.toUpperCase()}</small></span>
       <button className="iconButton" type="button" onClick={()=>removeDoc(doc.id)} aria-label={"Bỏ tài liệu "+doc.name}><X size={17}/></button></div>)}
     </div>}
     <div className="starterRow">
      <span className="dividerLine"/><span>hoặc</span><span className="dividerLine"/>
     </div>
     <button className="startBlank" type="button" onClick={startBlank}><span className="startBlankIcon"><FilePlus2 size={21}/></span><span><strong>Tạo kế hoạch mới từ đầu</strong><small>Không cần file nguồn, bắt đầu với trang trống</small></span><ArrowRight size={19}/></button>
     <div className="panelActions"><span className="mutedSmall"><ShieldCheck size={16}/> Không gửi file lên máy chủ</span><button className="btnPrimary" type="button" disabled={working||!docs.length} onClick={()=>setStage(2)}>Kiểm tra nội dung <ArrowRight size={18}/></button></div>
    </>}
    {stage===2&&<>
     <div className="sectionTitle"><span className="sectionIcon"><BookOpen size={21}/></span><div><h2>Kiểm tra và bổ sung</h2><p>Các thông tin được gợi ý chỉ là bản nháp, bạn có thể sửa trực tiếp.</p></div></div>
     <div className="formGrid">
      {(Object.keys(fieldLabels) as FieldKey[]).filter(k=>k!=="content").map(key=><label key={key} className="field">
       <span>{fieldLabels[key]}</span><input value={fields[key]} onChange={e=>changeField(key,e.target.value)} placeholder={"Nhập "+fieldLabels[key].toLowerCase()} autoComplete="off"/>
      </label>)}
     </div>
     <label className="field wide"><span>Nội dung kế hoạch <small>· có thể sửa, thêm, xóa trực tiếp</small></span>
      <textarea rows={15} value={fields.content} onChange={e=>changeField("content",e.target.value.slice(0,MAX_CONTENT_CHARS))} placeholder="Nhập nội dung kế hoạch, mỗi hoạt động hoặc tiết trên một dòng..."/>
     </label>
     <div className="editorMeta"><span>{fields.content.length.toLocaleString("vi-VN")} / 180.000 ký tự</span><span><Save size={14}/>{saveStatus}</span></div>
     {docs.length>0&&<div className="sources">
      <button type="button" className="textButton" aria-expanded={showSources} onClick={()=>setShowSources(!showSources)}><ChevronDown size={17} className={showSources?"rotated":""}/> {showSources?"Ẩn":"Xem"} nội dung gốc ({docs.length} tệp)</button>
      {showSources&&<div className="sourceContent">{docs.map(doc=><div key={doc.id}><b>{doc.name}</b><pre>{doc.lines.slice(0,80).join("\n")}</pre></div>)}</div>}
     </div>}
     <div className="panelActions"><button className="btnSecondary" type="button" onClick={()=>setStage(1)}><ArrowLeft size={17}/> Quay lại</button><button className="btnPrimary" type="button" onClick={()=>{setError("");setStage(3);}}>Chọn cách xuất <ArrowRight size={18}/></button></div>
    </>}
    {stage===3&&<>
     <div className="sectionTitle"><span className="sectionIcon"><HardDriveDownload size={21}/></span><div><h2>Tải kế hoạch của bạn</h2><p>Chọn file Word chuẩn hoặc sử dụng mẫu Word riêng của trường.</p></div></div>
     <div className="exportChoices">
      <label className={"exportCard "+(mode==="standard"?"selected":"")}>
       <input type="radio" name="exportMode" checked={mode==="standard"} onChange={()=>setMode("standard")}/>
       <span className="exportIcon"><FileCheck2 size={22}/></span><span><strong>Word A4 đơn giản</strong><small>Times New Roman, 13pt, có thể chỉnh sửa sau khi tải</small></span><span className="radioVisual"/>
      </label>
      <label className={"exportCard "+(mode==="custom"?"selected":"")}>
       <input type="radio" name="exportMode" checked={mode==="custom"} onChange={()=>setMode("custom")}/>
       <span className="exportIcon"><FileText size={22}/></span><span><strong>Word theo mẫu của tôi</strong><small>Giữ định dạng mẫu, điền nội dung vào các vị trí đánh dấu</small></span><span className="radioVisual"/>
      </label>
     </div>
     {mode==="custom"&&<div className="templateOptions">
      <label className="templatePicker" htmlFor="templateUpload"><UploadCloud size={19}/>{template?template.name:"Chọn mẫu .docx của trường"}<input id="templateUpload" type="file" accept=".docx" onChange={e=>{setTemplate(e.target.files?.[0]||null);e.target.value="";}}/></label>
      <button className="textButton" type="button" onClick={()=>{void getSample();}}><Download size={15}/> Tải mẫu Word tham khảo (.docx)</button>
      <button className="textButton" type="button" aria-expanded={showHelp} onClick={()=>setShowHelp(!showHelp)}><Info size={15}/> Mẫu Word cần chuẩn bị thế nào? <ChevronDown size={14} className={showHelp?"rotated":""}/></button>
      {showHelp&&<p className="contextHelp">Trong Word, gõ các thẻ <code>{"{{title}}"}</code>, <code>{"{{content}}"}</code>, <code>{"{{school}}"}</code>, <code>{"{{subject}}"}</code>, <code>{"{{grade}}"}</code> hoặc <code>{"{{teacher}}"}</code> đúng vị trí cần điền. EduPlan sẽ thay thế thẻ, kể cả khi Word chia thẻ thành nhiều đoạn chữ. Với mẫu phức tạp, hãy mở file xuất ra để kiểm tra lại bố cục.</p>}
     </div>}
     <div className="preview">
      <div className="previewTitle"><FileText size={17}/><strong>Xem trước nội dung</strong><span>{fields.content.split("\n").length} dòng</span></div>
      <div className="previewBody"><div className="previewSchool">{fields.school||"Tên trường"}</div><h3>{fields.title||"KẾ HOẠCH GIÁO DỤC"}</h3><p><b>Môn:</b> {fields.subject||"—"}　 <b>Lớp:</b> {fields.grade||"—"}</p><p><b>Giáo viên:</b> {fields.teacher||"—"}</p><h4>NỘI DUNG</h4><p className="previewText">{fields.content||"Bạn chưa nhập nội dung."}</p></div>
     </div>
     <div className="panelActions"><button className="btnSecondary" type="button" onClick={()=>setStage(2)}><ArrowLeft size={17}/> Chỉnh sửa</button><div className="actionGroup">
      <button className="btnSecondary" type="button" disabled={!fields.content.trim()} onClick={()=>window.print()}><Printer size={17}/> In / Lưu PDF</button>
      <button className="btnPrimary" type="button" disabled={working||!fields.content.trim()||(mode==="custom"&&!template)} onClick={()=>{void exportDocument();}}><Download size={18}/>{working?"Đang tạo...":"Tải Word"}</button>
     </div></div>
     <div className="exportCaution"><Info size={16}/> Hãy kiểm tra nội dung và bố cục Word/PDF trước khi nộp chính thức.</div>
    </>}
    {error&&<div className="feedback error" role="alert"><Info size={18}/><span>{error}</span></div>}
    {notice&&<div className="feedback success" role="status"><CheckCircle2 size={18}/><span>{notice}</span></div>}
   </section>
   <div className="bottomStrip"><div className="privacyNote"><ShieldCheck size={21}/><div><strong>Riêng tư theo thiết kế</strong><p>Không tài khoản, không tải tài liệu lên máy chủ. Bản nháp tự lưu trong trình duyệt này.</p></div></div><button className="resetLink" type="button" onClick={reset}><RefreshCcw size={16}/> Bắt đầu lại / Xóa bản nháp</button></div>
   <div className="footLinks"><span><Save size={15}/>{saveStatus}</span><a href={repo} target="_blank" rel="noreferrer">GitHub: brteduvn.github.io ↗</a><a href="mailto:admin@brt.edu.vn">admin@brt.edu.vn</a></div>
  </main>
  <footer className="footer"><span>EduPlan OSS v{__EDUPLAN_BUILD_INFO__.version}</span><span>Build: {__EDUPLAN_BUILD_INFO__.builtAtVietnam}</span><span>Mã nguồn mở · Giai đoạn thử nghiệm</span></footer>
  <section className="printSheet" aria-hidden={stage!==3}>
   <div className="printSchool">{fields.school}</div><h1>{fields.title||"KẾ HOẠCH GIÁO DỤC"}</h1>
   <p><b>Môn học:</b> {fields.subject}　 <b>Khối/lớp:</b> {fields.grade}</p>
   <p><b>Giáo viên:</b> {fields.teacher}</p><h2>NỘI DUNG</h2><div>{fields.content}</div>
  </section>
 </div>;
}
