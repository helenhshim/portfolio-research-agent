import type {ReactNode,RefObject} from 'react';
export type LayoutKind='thread'|'workspace'|'command';
export function ThreadLayout({children}:{children:ReactNode}){return <main className="a3-thread-layout">{children}</main>;}
// Preserve the same thread subtree when inspection opens/closes: drafts, native
// disclosures and attempt clocks must not remount with a different layout.
export function WorkspaceLayout({thread,brief,narrow,threadRef}:{thread:ReactNode;brief?:ReactNode;narrow:boolean;threadRef?:RefObject<HTMLElement|null>}){return <main className={brief?'a3-workspace-layout':'a3-research-layout'}><section ref={threadRef} className={brief?'a3-thread-pane':'a3-thread-layout'} aria-label="Research thread" hidden={Boolean(brief)&&narrow}>{thread}</section>{brief&&<section className="a3-brief-pane" aria-label="Research brief and sources">{brief}</section>}</main>;}
export function CommandLayout({rail,children}:{rail:ReactNode;children:ReactNode}){return <main className="a3-command-layout"><aside className="a3-rail" aria-label="Current session">{rail}</aside><section className="a3-command-main"><div className="a3-thread-layout">{children}</div></section></main>;}
