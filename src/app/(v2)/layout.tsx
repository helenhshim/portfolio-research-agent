import type {Metadata} from 'next';
import localFont from 'next/font/local';
import '../../../docs/design/tokens.css';
import '../../components/a3/a3.css';
const sans=localFont({src:'../../../public/fonts/geist-latin.woff2',variable:'--geist-sans',weight:'400 500',display:'swap'});
const mono=localFont({src:'../../../public/fonts/geist-mono-latin.woff2',variable:'--geist-mono',weight:'400 500',display:'swap'});
export const metadata:Metadata={title:'Research · NVIDIA profitability',description:'A focused, source-backed research workspace.',robots:{index:false,follow:false}};
// DESIGN-DECISION: Separate root layouts prevent legacy global styles from leaking into A3.
export default function V2Layout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body className="a3">{children}</body></html>;}
