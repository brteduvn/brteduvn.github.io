import {initialFields,type Fields,type SourceDoc} from "./document";

export const DRAFT_KEY = "eduplan-oss:draft:v1";
export type SavedDraft = {
  version: 1;
  fields: Fields;
  docs: SourceDoc[];
  stage: 1 | 2 | 3;
  savedAt: string;
};
export function readDraft(store?: Pick<Storage,"getItem">):SavedDraft|null {
  try {
    const storage = store ?? (typeof localStorage !== "undefined" ? localStorage : undefined);
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw || raw.length > 1_200_000) return null;
    const item:unknown = JSON.parse(raw);
    if (!item || typeof item !== "object" || !("version" in item) || item.version !== 1) return null;
    const draft = item as Partial<SavedDraft>;
    if (!draft.fields || typeof draft.fields !== "object" || !Array.isArray(draft.docs)) return null;
    const fields = {...initialFields};
    for(const name of Object.keys(initialFields) as (keyof Fields)[]){
      const value = draft.fields[name];
      if(typeof value === "string") fields[name] = value.slice(0,180_000);
    }
    const docs:SourceDoc[] = draft.docs.slice(0,30).filter(doc =>
      doc && typeof doc.name === "string" && typeof doc.id === "string" &&
      typeof doc.kind === "string" && Array.isArray(doc.lines)
    ).map(doc => ({
      id:doc.id.slice(0,400),name:doc.name.slice(0,180),kind:doc.kind,
      lines:doc.lines.filter((line):line is string => typeof line === "string").slice(0,5000),
    }));
    const stage = draft.stage === 2 || draft.stage === 3 ? draft.stage : 1;
    return {version:1,fields,docs,stage,savedAt:typeof draft.savedAt === "string" ? draft.savedAt : ""};
  } catch { return null; }
}
export function saveDraft(value:SavedDraft,store?: Pick<Storage,"setItem">):boolean {
  try {
    const storage = store ?? (typeof localStorage !== "undefined" ? localStorage : undefined);
    if (!storage) return false;
    const serialized=JSON.stringify(value);
    if(serialized.length>1_200_000) return false;
    storage.setItem(DRAFT_KEY,serialized);
    return true;
  }catch{return false;}
}
export function clearDraft(store?: Pick<Storage,"removeItem">):void {
  try{
    (store ?? (typeof localStorage !== "undefined" ? localStorage : undefined))?.removeItem(DRAFT_KEY);
  }catch { /* Browser storage may be disabled. */ }
}
