'use client';
import {useRef,useState} from 'react';
import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';
import {financialRows,metricLabels,displayValue,displayChange} from '../lib/view-model.ts';
const cn=(...values:Parameters<typeof clsx>)=>twMerge(clsx(...values));
type Inputs={primary_goal:string;holding_period:string;risk_tolerance:string;tickers:string[];holding_rationale:string};
const goals=[['income','Generate ongoing income'],['growth','Grow my investment value'],['planned_need','Protect money for a planned need']];
const periods=[['short','Short term: less than 3 years'],['medium','Medium term: 3–10 years'],['long','Long term: more than 10 years']];
const rationales=[['profitable_growth','Sustain profitable business growth'],['dependable_income','Provide dependable dividend income'],['business_resilience','Remain financially resilient']];
const stageLabels:Record<string,string>={preparing:'Preparing the verified report pair',analyzing:'Reading both reports and weighing the evidence',checking:'Checking source references and selected figures'};
function label(options:string[][],value:string){return options.find(row=>row[0]===value)?.[1]||value;}
function text(value:string,packet:any){return value.replace(/\{\{fact:([^}]+)\}\}/g,(_,id)=>packet.facts.find((f:any)=>f.id===id)?.display||packet.comparisons.find((c:any)=>c.id===id)?.display||'Unavailable evidence');}
function Field({id,title,helper,value,onChange,options}:{id:string;title:string;helper?:string;value:string;onChange:(value:string)=>void;options:string[][]}){return <div className="field"><label htmlFor={id}>{title}</label>{helper&&<p className="field-help" id={id+'-help'}>{helper}</p>}<select id={id} value={value} aria-describedby={helper?id+'-help':undefined} onChange={e=>onChange(e.target.value)}>{options.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></div>;}
export default function ResearchWorkspace({packet,example,liveConfigured}:{packet:any;example:any;liveConfigured:boolean}){
 const [inputs,setInputs]=useState<Inputs>({primary_goal:'income',holding_period:'short',risk_tolerance:'low',tickers:['NVDA'],holding_rationale:'dependable_income'});
 const [output,setOutput]=useState<any>(null);
 const [exampleMode,setExampleMode]=useState(false);
 const [busy,setBusy]=useState(false);
 const [stage,setStage]=useState('preparing');
 const [error,setError]=useState('');
 const [showSetup,setShowSetup]=useState(true);
 const heading=useRef<HTMLHeadingElement>(null);
 const change=(key:keyof Inputs,value:string)=>setInputs(current=>({...current,[key]:value}));
 function showExample(){setOutput(example);setExampleMode(true);setError('');setShowSetup(false);requestAnimationFrame(()=>heading.current?.focus());}
 async function generate(){
  if(busy)return;setBusy(true);setError('');setStage('preparing');const submitted=structuredClone(inputs);
  try{
   const response=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(submitted)});
   if(!response.ok){const failure=await response.json();throw Error(failure.error||'Research could not start.');}
   if(!response.body)throw Error('No research response was received.');
   const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';let completed=false;
   while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let newline;
    while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(!line)continue;const event=JSON.parse(line);
     if(event.type==='stage')setStage(event.stage);
     if(event.type==='error')throw Error(event.error);
     if(event.type==='result'){setOutput(event.output);setExampleMode(false);setShowSetup(false);completed=true;requestAnimationFrame(()=>heading.current?.focus());}
    }
   }
   if(!completed)throw Error('The connection ended before research completed. Your inputs are preserved.');
  }catch(failure){setError(failure instanceof Error?failure.message:'Research could not complete. Try again.');}
  finally{setBusy(false);}
 }
 const rows=output?financialRows(output,packet):[];
 const result=output?.result;
 const assessment=result?.premise_assessment;
 return <main className="workspace">
  <nav className="app-nav" aria-label="Workspace"><span className="brand">Portfolio research</span><span className="eyebrow">MVP / NVIDIA</span></nav>
  {showSetup?<section className="setup" aria-labelledby="setup-heading">
   <p className="eyebrow">An earnings brief for the reason you own it</p>
   <h1 id="setup-heading">What should this holding do for you?</h1>
   <p className="intro">Connect the report to your goals. See what changed, which evidence matters, and what to keep watching.</p>
   <div className="source-note"><span className="company-name">NVDA <span>NVIDIA</span></span><p>Verified SEC snapshots: FY2027 Q2 versus Q1. Releases dated Aug 26 and May 20, 2026. Source data is frozen; analysis is generated for your inputs.</p></div>
   <form onSubmit={e=>{e.preventDefault();void generate();}}>
    <fieldset disabled={busy}><legend className="sr-only">Research context</legend>
     <Field id="goal" title="What is your primary goal?" value={inputs.primary_goal} onChange={v=>change('primary_goal',v)} options={goals}/>
     <Field id="rationale" title="What are you relying on NVIDIA to do?" value={inputs.holding_rationale} onChange={v=>change('holding_rationale',v)} options={rationales}/>
     <div className="form-pair"><Field id="period" title="How long do you expect to hold these investments?" helper="Choose your intended holding period. This helps us put company developments in context." value={inputs.holding_period} onChange={v=>change('holding_period',v)} options={periods}/>
     <Field id="risk" title="How much uncertainty are you comfortable with?" value={inputs.risk_tolerance} onChange={v=>change('risk_tolerance',v)} options={[['low','Low'],['medium','Medium'],['high','High']]}/></div>
    </fieldset>
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="primary" type="submit" disabled={busy||!liveConfigured}>{busy?'Research in progress':'Generate brief'}</button><button type="button" className="text-button" onClick={showExample} disabled={busy}>View checked example</button></div>
    {!liveConfigured&&<p className="field-help">Live research is not enabled on this deployment. You can explore the checked example.</p>}
   </form>
   {busy&&<div className="progress" role="status" aria-live="polite"><p className="eyebrow">Research in progress</p><p>{stageLabels[stage]||stage}</p><p className="field-help">Research can take a few minutes. Results appear after checking.</p></div>}
  </section>:<article className="receipt" aria-labelledby="result-heading">
   <div className="result-actions"><button className="text-button" onClick={()=>{setShowSetup(true);setError('');}}>Edit research inputs</button><span className="eyebrow">{exampleMode?'Checked example':'Generated for your inputs'}</span></div>
   <header className="receipt-header"><span className="ticker">NVDA</span><div className="period-stamp">NVIDIA<br/>FY2027 Q2 vs Q1<br/>Aug 26 vs May 20, 2026</div></header>
   <p className="eyebrow takeaway-label">Your earnings takeaway</p>
   <h1 id="result-heading" ref={heading} tabIndex={-1}>{assessment?.headline||result.assessment_fallback?.headline||'Not enough checked evidence'}</h1>
   {assessment&&<p className="meaning">{text(assessment.what_this_means,packet)}</p>}
   {!assessment&&<p className="meaning">The generated takeaway did not pass the checks. Evidence that passed remains below for review.</p>}
   <p className="context-line">{label(goals,output.inputs.primary_goal)} · {label(rationales,output.inputs.holding_rationale)} · {label(periods,output.inputs.holding_period)} · {output.inputs.risk_tolerance} risk</p>
   <section className="result-section"><h2>What happened / what it means</h2>
    {result.paired_developments.length?result.paired_developments.map((development:any)=><div className="development" key={development.id}>
     <span className={cn('change-label',development.change_type==='changed'&&'changed')}>{development.change_type==='current_only'?'Current disclosure':development.change_type==='unchanged'?'Unchanged':development.change_type==='expanded'?'Expanded':'Reported progress'}</span>
     <p>{development.change_type!=='current_only'&&<>{development.prior_state} </>}{development.current_state}</p><p className="implication">{development.why_it_matters}</p>
     <details><summary>Compare the evidence</summary><div className="evidence-pair"><div><span className="eyebrow">Prior quarter</span><p>{development.prior_state}</p>{development.prior_evidence.map((e:any)=><blockquote key={e.paragraph_id}>{e.quote}</blockquote>)}</div><div><span className="eyebrow">Current quarter</span><p>{development.current_state}</p>{development.current_evidence.map((e:any)=><blockquote key={e.paragraph_id+e.quote}>{e.quote}</blockquote>)}</div></div><SourceLinks packet={packet}/></details>
    </div>):<p>No paired narrative change passed the checks. Current-only findings remain available in the evidence details.</p>}
   </section>
   <section className="result-section"><h2>Financial evidence behind the takeaway</h2>
    {rows.length?<table className="financial-table"><thead><tr><th scope="col">Metric</th><th scope="col">Value / change</th><th scope="col">Why it matters</th></tr></thead><tbody>{rows.map((row:any)=><tr key={row.fact.id}><td>{metricLabels[row.fact.metric]||row.fact.metric}</td><td><span className="financial-value">{displayValue(row.fact)}</span>{row.comparison&&<span className="comparison">{displayChange(row.comparison)}</span>}{row.prior&&<span className="comparison">{row.comparison.id.endsWith(':qoq')?'Q1':'Prior year'}: {displayValue(row.prior)}</span>}{row.comparison?.id.endsWith(':qoq')&&row.yoy&&<span className="comparison">{displayChange(row.yoy)}</span>}</td><td>{row.implication}</td></tr>)}</tbody></table>:<p>No financial measure was selected with a valid evidence chain. See the unresolved questions below.</p>}
   </section>
   <section className="result-section"><h2>Unanswered / watch next</h2>{result.watch_items.length?<ol className="watch-list">{result.watch_items.map((watch:any)=><li key={watch.id}><p>{watch.question}</p><details><summary>What would change the interpretation?</summary><p><span className="eyebrow">Evidence to watch</span><br/>{watch.signal}</p><p><span className="eyebrow">Strengthens if</span><br/>{watch.strengthens_if}</p><p><span className="eyebrow">Weakens if</span><br/>{watch.weakens_if}</p></details></li>)}</ol>:<p>No supported watch item was produced.</p>}
    <p className="context-line">Assessment: {assessment?.status||'unresolved'}. Follow-up investigation and monitoring have not run.</p>
   </section>
   {result.uncertainties.length>0&&<details className="result-section"><summary>Material uncertainties</summary>{result.uncertainties.map((u:any)=><p key={u.id}>{text(u.text,packet)}</p>)}</details>}
   {result.advisor_discussion&&<details className="result-section"><summary>Discussion point for advisor review</summary><blockquote>{result.advisor_discussion.text}</blockquote></details>}
   <details className="result-section"><summary>Sources, calculation basis and checks</summary><p>Q2 ended July 26, 2026; Q1 ended April 26, 2026. QoQ compares consecutive fiscal quarters. YoY compares the matched prior-year fiscal quarter. Figures are code-owned and rounded for display; quarterly changes can reflect seasonality.</p><SourceLinks packet={packet}/><p>Quote matching and reference/dependency checks passed for the displayed assertions. These checks do not establish every interpretation. Company-provided formats are not independent corroboration.</p><p>{result.checks.dropped_count+(result.comparison_checks?.dropped_count||0)} items removed by checks. {output.model} / {output.effort} reasoning / {(output.elapsed_ms/1000).toFixed(0)} seconds.</p>{output.run_id&&<p>Run reference: {output.run_id}</p>}<p>Source cutoff: {packet.source_cutoff}. No prices, external macro data, client identity or portfolio weights. This brief explains the supplied holding rationale; it does not establish portfolio impact or investment suitability.</p><details><summary>Underlying findings</summary>{result.findings.map((finding:any)=><div key={finding.id}><p>{text(finding.text,packet)}</p>{finding.evidence.map((e:any)=><blockquote key={e.id}>{e.quote}</blockquote>)}</div>)}</details></details>
   <footer className="receipt-footer">Frozen public SEC evidence · {exampleMode?'Saved checked example':'Live model analysis'}<br/>Decision support for review · No buy/sell recommendation</footer>
  </article>}
  <footer className="app-footer">One holding. The evidence that matters. The next question to ask.</footer>
 </main>;
}
function SourceLinks({packet}:{packet:any}){return <p className="source-links"><a href={packet.comparison_context.prior.url} target="_blank" rel="noopener noreferrer">Q1 SEC release</a><span aria-hidden="true"> · </span><a href={packet.comparison_context.current.url} target="_blank" rel="noopener noreferrer">Q2 SEC release</a></p>;}
