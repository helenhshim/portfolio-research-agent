import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Portfolio research · Evidence-backed earnings brief',description:'A focused earnings brief connecting public SEC reports to your holding rationale and research goals.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
