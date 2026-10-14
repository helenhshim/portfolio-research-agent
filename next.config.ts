import type {NextConfig} from 'next';
// Use an isolated directory for the hot-reloading V3 preview so concurrent
// baseline servers and production build checks keep their existing output.
const config:NextConfig={distDir:process.env.PORTFOLIO_NEXT_DIST_DIR||'.next',poweredByHeader:false,devIndicators:false,turbopack:{root:process.cwd()},redirects:async()=>[{source:'/',has:[{type:'host' as const,value:'research\\.helenshim\\.me'}],destination:'/v3',permanent:false}]};
export default config;
