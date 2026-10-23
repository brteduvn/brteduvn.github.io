import {useState,type ChangeEvent} from "react";
import {ArrowRight,CheckCircle2,Download,FileCheck2,FileText,GraduationCap,UploadCloud,X,ShieldCheck,Info} from "lucide-react";
import {ACCEPT,createSampleTemplateDocx,downloadBlob,exportFromTemplate,exportStandard,fieldLabels,initialFields,parseDocument,suggestFields,type Fields,type FieldKey,type SourceDoc} from "./lib/document";

type Stage=1|2|3;
export default function App(){
 const [stage,setStage]=useState<Stage>(1),[docs,setDocs]=useState<SourceDoc[]>([]);
 const [fields,setFields]=useState<Fields>(initialFields),[template,setTemplate]=useState<File|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [showSource,setShowSource]=useState(false);
 async function addFiles(e:ChangeEvent<HTMLInputElement>){
  const files=Array.from(e.target.files||[]);e.target.value="";if(!files.length)return;
  setBusy(true);setError("");const successful:SourceDoc[]=[],failed:string[]=[];
  for(const f of files)try{successful.push(await parseDocument(f));}catch(err){failed.push(f.name+": "+(err instanceof Error?err.message:"Không đọc được"));}
  if(successful.length){
   setDocs(old=>{const result=[...old,...successful];return result.filter((v,i)=>result.findIndex(w=>w.id===v.id)===i);});
   setFields(old=>{const hints=suggestFields(successful);const values={...old};
    (Object.keys(hints) as FieldKey[]).forEach(k=>{if(!values[k]&&hints[k])values[k]=hints[k]!;});
    if(!values.content)values.content=successful.flatMap(d=>d.lines).join("\n").slice(0,35000);
    return values;
   });
  }
  if(failed.length)setError(failed.join(" • "));setBusy(false);
 }
 async function doExport(){
  setBusy(true);setError("");setMessage("");
  try{if(template){const result=await exportFromTemplate(template,fields);setMessage("Đã tạo file Word theo mẫu ("+result.replaced+" trường).");}
   else{await exportStandard(fields);setMessage("Đã tạo file Word để tải xuống.");}}
  catch(e){setError(e instanceof Error?e.message:"Không thể xuất Word.");}
  finally{setBusy(false);}
 }
 function restart(){setStage(1);setDocs([]);setFields(initialFields);setTemplate(null);setError("");setMessage("");}
 return <div className="page">
 <header className="topbar"><button className="brand" onClick={restart} aria-label="EduPlan - trở về đầu"><GraduationCap/><span>EduPlan <b>OSS</b></span></button><div className="topRight"><span>Miễn phí • Mã nguồn mở</span><a href="https://github.com/brteduvn/eduplan-oss" target="_blank" rel="noreferrer">GitHub ↗</a></div></header>
 <main><section className="hero"><span className="eyebrow">BỘ CÔNG CỤ DÀNH CHO GIÁO VIÊN</span><h1>Kế hoạch giáo dục.<br/><em>Đơn giản từ bước đầu.</em></h1><p>Chọn tài liệu → xem lại → tải Word. Không tài khoản. Không cần đọc hướng dẫn.</p></section>
 <nav className="steps" aria-label="Các bước">{["Chọn tài liệu","Xem lại nội dung","Tải Word"].map((s,i)=><div key={s} className={"step "+(stage===i+1?"active ":"")+(stage>i+1?"done":"")}><span>{stage>i+1?<CheckCircle2 size={17}/>:i+1}</span>{s}</div>)}</nav>
 <section className="panel">
 {stage===1&&<><div className="panelHeading"><h2>Chọn tài liệu của bạn</h2><p>Thêm một hoặc nhiều file phân phối chương trình, tài liệu giảng dạy hoặc bản nháp hiện có.</p></div><label className="drop" htmlFor="files"><UploadCloud size={33}/><strong>Nhấn để chọn tài liệu</strong><span>Word (.docx) · Excel (.xlsx) · CSV · TXT · MD</span><input id="files" type="file" multiple accept={ACCEPT} onChange={addFiles}/></label><p className="hint"><ShieldCheck size={17}/> File được đọc trên trình duyệt, không tự tải lên máy chủ.</p>
 {docs.length>0&&<div className="files"><h3>{docs.length} tài liệu đã chọn</h3>{docs.map(d=><div className="file" key={d.id}><FileText size={19}/><span>{d.name} <small>({d.lines.length} dòng)</small></span><button onClick={()=>setDocs(old=>old.filter(x=>x.id!==d.id))} aria-label={"Xóa "+d.name}><X size={18}/></button></div>)}</div>}
 <div className="actions"><span>Có thể chọn nhiều file cùng lúc.</span><button className="primary" disabled={!docs.length||busy} onClick={()=>setStage(2)}>{busy?"Đang đọc...":"Tiếp tục"} <ArrowRight size={18}/></button></div></>}
 {stage===2&&<><div className="panelHeading"><h2>Xem lại nội dung</h2><p>EduPlan tự gợi ý khi có thể. Bạn hãy kiểm tra và sửa thông tin chưa đúng.</p></div>
 <div className="formGrid">{(Object.keys(fieldLabels) as FieldKey[]).filter(x=>x!=="content").map(k=><label className="field" key={k}><span>{fieldLabels[k]}</span><input value={fields[k]} onChange={e=>setFields(old=>({...old,[k]:e.target.value}))} placeholder={"Nhập "+fieldLabels[k].toLowerCase()}/></label>)}</div>
 <label className="field"><span>Nội dung kế hoạch</span><textarea value={fields.content} onChange={e=>setFields(old=>({...old,content:e.target.value}))} rows={13} placeholder="Nội dung đọc từ tài liệu sẽ ở đây..."/></label>
 <button className="plain" onClick={()=>setShowSource(!showSource)} aria-expanded={showSource}><Info size={16}/>{showSource?"Ẩn nội dung nguồn":"Xem nội dung nguồn đã đọc"}</button>
 {showSource&&<div className="sourcePreview">{docs.map(d=><div key={d.id}><strong>{d.name}</strong><pre>{d.lines.slice(0,60).join("\n")}</pre></div>)}</div>}
 <div className="actions"><button className="secondary" onClick={()=>setStage(1)}>Quay lại</button><button className="primary" onClick={()=>setStage(3)}>Chọn cách xuất <ArrowRight size={18}/></button></div></>}
 {stage===3&&<><div className="panelHeading"><h2>Tải kế hoạch Word</h2><p>Dùng mẫu tiêu chuẩn hoặc mẫu DOCX riêng của trường. Tài liệu gốc không thay đổi.</p></div>
 <div className="options"><label className={"option "+(!template?"chosen":"")}><input type="radio" name="mode" checked={!template} onChange={()=>setTemplate(null)}/><FileCheck2 size={23}/><span><strong>Mẫu Word tiêu chuẩn</strong><small>Xuất DOCX đơn giản, có thể chỉnh sửa</small></span></label>
 <label className={"option "+(template?"chosen":"")}><input type="radio" name="mode" checked={!!template} onChange={()=>document.getElementById("template")?.click()}/><FileText size={23}/><span><strong>Mẫu Word của tôi</strong><small>Giữ bố cục của mẫu có đánh dấu các thẻ dữ liệu</small></span></label></div>
 <div className="templateArea"><label className="secondary" htmlFor="template">{template?"Đổi mẫu: "+template.name:"Chọn mẫu DOCX của bạn"}</label><input id="template" type="file" accept=".docx" onChange={e=>{setTemplate(e.target.files?.[0]||null);e.target.value="";}}/>
 <p className="hint">Mẫu riêng hiện hỗ trợ thẻ điền sẵn: <code>{"{{title}}"}</code>, <code>{"{{content}}"}</code>, <code>{"{{school}}"}</code>, <code>{"{{subject}}"}</code>, <code>{"{{grade}}"}</code>, <code>{"{{teacher}}"}</code>. Mỗi thẻ cần được gõ liền trong một vùng chữ Word.</p>
 <button className="plain" onClick={async()=>{try{downloadBlob(await createSampleTemplateDocx(),"eduplan-mau-tham-khao.docx");}catch{setError("Không thể tạo mẫu Word.");}}}>Tải mẫu Word tham khảo (.docx)</button></div>
 <div className="actions"><button className="secondary" onClick={()=>setStage(2)}>Quay lại</button><button className="primary" disabled={busy} onClick={doExport}><Download size={18}/>{busy?"Đang tạo...":"Tải file Word"}</button></div></>}
 {error&&<p className="error" role="alert">{error}</p>}{message&&<p className="success" role="status">{message}</p>}
 </section>
 <aside className="bottom"><div><h3>Chỉ những gì bạn cần.</h3><p>Không đăng ký • Không gửi dữ liệu lên máy chủ • Luôn miễn phí</p></div><a href="https://github.com/brteduvn/eduplan-oss">Xem mã nguồn ↗</a></aside></main>
 <footer>EduPlan OSS v0.1.0 • Bản thử nghiệm cần kiểm tra tài liệu trước khi sử dụng chính thức</footer></div>;
}