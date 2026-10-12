'use client';
import type {ButtonHTMLAttributes,HTMLAttributes,ReactNode} from 'react';
export type TextStyle='display'|'title'|'strong'|'body'|'secondary'|'data'|'meta'|'cite';
export function Text({style='body',as='span',className='',...props}:Omit<HTMLAttributes<HTMLElement>,'style'>&{style?:TextStyle;as?:'span'|'p'|'div'|'h1'|'h2'|'h3';children?:ReactNode}){
 const Tag=as;return <Tag {...props} className={`text-${style} ${className}`}/>;
}
export function Button({variant='quiet',className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'outline'|'quiet'|'link'|'icon'}){
 return <button type="button" {...props} className={`a3-button a3-button-${variant} text-strong ${className}`}/>;
}
export function Chip({children}:{children:ReactNode}){return <span className="a3-chip text-data">{children}</span>;}
export type SquareState='live'|'done'|'failed'|'idle';
export function StatusSquare({state}:{state:SquareState}){return <span aria-hidden="true" className={`a3-square a3-square-${state}`}/>;}
export function Hairline({ink=false}:{ink?:boolean}){return <hr className={ink?'a3-rule-ink':'a3-rule'}/>;}
export function Sparkline({values,label,signalIndex,table=false}:{values:number[];label:string;signalIndex?:number;table?:boolean}){
 if(values.length<2||values.some(v=>!Number.isFinite(v)))return null;
 const min=Math.min(...values),max=Math.max(...values),range=max-min||1;
 const points=values.map((v,i)=>[5+i/(values.length-1)*90,16-(v-min)/range*12]);
 return <svg role="img" aria-label={label} viewBox="0 0 100 20" className={`a3-spark ${table?'a3-spark-table':''}`}><polyline points={points.map(p=>p.join(',')).join(' ')}/>{signalIndex!==undefined&&points[signalIndex]&&<rect className="a3-spark-mark" x={points[signalIndex][0]-2} y={points[signalIndex][1]-2}/>}</svg>;
}
export function FigureText({text}:{text:string}){
 // Dates, citation indices and figures within exact source quotes also use mono.
 return <>{text.split(/(\d[\d,.:%/\-]*|[+−$]\d[\d,.:%]*)/g).filter(Boolean).map((part,i)=>/\d/.test(part)?<Text key={i} style="data">{part}</Text>:part)}</>;
}
