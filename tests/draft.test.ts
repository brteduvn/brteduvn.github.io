import {describe,it,expect} from "vitest";
import {DRAFT_KEY,clearDraft,readDraft,saveDraft,type SavedDraft} from "../src/lib/draft";
import {initialFields} from "../src/lib/document";
function storage(){
 const values=new Map<string,string>();
 return {
  getItem:(key:string)=>values.get(key)||null,
  setItem:(key:string,value:string)=>{values.set(key,value);},
  removeItem:(key:string)=>{values.delete(key);},
 };
}
const draft:SavedDraft={version:1,fields:{...initialFields,school:"THCS Hòa Hiệp",content:"Tiết 1"},docs:[],stage:2,savedAt:"2026-10-23T05:00:00Z"};
describe("local draft privacy and recovery",()=>{
 it("stores and restores a draft without a server",()=>{
  const db=storage();expect(saveDraft(draft,db)).toBe(true);
  expect(readDraft(db)).toEqual(draft);
  expect(db.getItem(DRAFT_KEY)).toContain("THCS Hòa Hiệp");
 });
 it("clears saved content when requested",()=>{
  const db=storage();saveDraft(draft,db);clearDraft(db);
  expect(readDraft(db)).toBeNull();
 });
 it("refuses malformed or oversized records",()=>{
  const db=storage();db.setItem(DRAFT_KEY,"{broken");
  expect(readDraft(db)).toBeNull();
  db.setItem(DRAFT_KEY,"x".repeat(1_200_001));
  expect(readDraft(db)).toBeNull();
 });
});
