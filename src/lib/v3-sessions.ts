export const V3_SESSION_LIMIT=10;
export type V3SessionSummary={id:string;title:string;updatedAt:number;outcome:string;hasAnswer:boolean};
export const emptyV3Session=(id:string,now:number):V3SessionSummary=>({id,title:'New research',updatedAt:now,outcome:'Draft',hasAnswer:false});
// Metadata only: actual turns, drafts, source state and revision gate are held by
// their mounted session. No browser storage or server history is installed.
export function updateV3Session(sessions:V3SessionSummary[],id:string,patch:Partial<Omit<V3SessionSummary,'id'>>){
 return sessions.map(s=>s.id===id?{...s,...patch}:s);
}
export function sortedV3Sessions(sessions:readonly V3SessionSummary[]){return [...sessions].sort((a,b)=>b.updatedAt-a.updatedAt);}
export function v3SessionOutcome(status?:string){
 const labels:Record<string,string>={running:'Researching',complete:'Completed',partial:'Completed with limitations',source_limited:'Source limited',out_of_scope:'Outside coverage',clarification:'Needs clarification',failed:'Failed',check_failed:'Reference check failed',stopped:'Stopped'};
 return status?labels[status]??'Completed':'Draft';
}
