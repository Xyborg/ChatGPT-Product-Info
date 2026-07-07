// ChatGPT GEO/AEO Research - Shadow DOM UI.
(function () {
    'use strict';

    const CORE = () => window.CgptGeoResearchCore;
    const TABS = [
        ['overview', 'Overview'],
        ['flow', 'Request flow'],
        ['queries', 'Fan-out queries'],
        ['sources', 'Sources'],
        ['citations', 'Citations'],
        ['products', 'Products'],
        ['browse', 'Browsing'],
        ['research', 'Deep Research'],
        ['reasoning', 'Reasoning'],
        ['saved', 'Saved'],
    ];
    const PRODUCT_MARKET_COUNTRIES = [
        ['us', 'United States'], ['de', 'Germany'], ['gb', 'United Kingdom'], ['ca', 'Canada'], ['au', 'Australia'],
        ['fr', 'France'], ['es', 'Spain'], ['it', 'Italy'], ['nl', 'Netherlands'], ['be', 'Belgium'],
        ['ch', 'Switzerland'], ['at', 'Austria'], ['se', 'Sweden'], ['dk', 'Denmark'], ['no', 'Norway'],
        ['fi', 'Finland'], ['ie', 'Ireland'], ['pl', 'Poland'], ['pt', 'Portugal'], ['br', 'Brazil'],
        ['mx', 'Mexico'], ['ar', 'Argentina'], ['cl', 'Chile'], ['co', 'Colombia'], ['jp', 'Japan'],
        ['kr', 'South Korea'], ['in', 'India'],
    ];
    const PRODUCT_MARKET_LANGUAGES = [
        ['en', 'English'], ['de', 'German'], ['es', 'Spanish'], ['fr', 'French'], ['it', 'Italian'],
        ['nl', 'Dutch'], ['pt', 'Portuguese'], ['sv', 'Swedish'], ['da', 'Danish'], ['no', 'Norwegian'],
        ['fi', 'Finnish'], ['pl', 'Polish'], ['ja', 'Japanese'], ['ko', 'Korean'], ['hi', 'Hindi'],
    ];

    const state = {
        host: null,
        shadow: null,
        overlay: null,
        body: null,
        status: null,
        activeTab: 'overview',
        intel: null,
        raw: null,
        token: null,
        loadingOffers: false,
        loadingInsights: false,
        offersStarted: false,
        offerProgress: '',
        insightProgress: '',
        openInsights: {},
        productMarket: null,
        productMarketLoaded: false,
        lastConversationId: '',
        fromCache: false,
        savedFilters: { projectId: '', tagId: '' },
    };
    const UNKNOWN_PIPELINE = 'Unknown';

    const CSS = `
        :host{
            --background:#f8fafc;--foreground:#09090b;--card:#ffffff;--card-foreground:#09090b;
            --popover:#ffffff;--popover-foreground:#09090b;--primary:#09090b;--primary-foreground:#fafafa;
            --secondary:#f4f4f5;--secondary-foreground:#18181b;--muted:#f4f4f5;--muted-foreground:#71717a;
            --accent:#f4f4f5;--accent-foreground:#18181b;--destructive:#dc2626;--destructive-foreground:#fef2f2;
            --border:#e4e4e7;--input:#e4e4e7;--ring:#18181b;--chart:#2563eb;--success:#16a34a;
            --radius:8px;--shadow:0 20px 60px rgba(9,9,11,.22);--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
            --sans:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        }
        *{box-sizing:border-box}
        button,input,textarea,select{font:inherit}
        button{letter-spacing:0}
        button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
        .overlay{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:28px;background:rgba(9,9,11,.45);pointer-events:auto}
        .overlay.open{display:flex}
        .modal{width:min(1560px,96vw);height:94vh;background:var(--background);border:1px solid rgba(255,255,255,.42);border-radius:calc(var(--radius) + 6px);box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;color:var(--foreground);font-family:var(--sans);font-size:14px;line-height:1.45}
        .head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;background:var(--card);border-bottom:1px solid var(--border)}
        .brand{display:flex;align-items:center;gap:10px;min-width:0}.brandicon{width:22px;height:22px;flex:none;filter:brightness(0);opacity:.9}.brandcopy{min-width:0}.title{font-size:15px;font-weight:650;line-height:1.1;white-space:nowrap}.sub{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-family:var(--mono);font-size:11px;color:var(--muted-foreground);min-width:0;max-width:60vw}.metaitem{display:inline-flex;align-items:center;gap:4px;min-width:0}.metalabel{color:#a1a1aa}.metavalue{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:28vw}.metasep{color:#d4d4d8}
        .acts{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.status{font-family:var(--mono);font-size:11px;color:var(--muted-foreground);min-height:18px}
        .btn{height:34px;border:1px solid var(--input);background:var(--card);color:var(--foreground);border-radius:calc(var(--radius) - 2px);padding:0 12px;cursor:pointer;font-size:13px;font-weight:500;line-height:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;box-shadow:0 1px 1px rgba(9,9,11,.03);transition:background .14s ease,color .14s ease,border-color .14s ease,box-shadow .14s ease}.btn:hover{background:var(--accent);color:var(--accent-foreground)}.btn.primary{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary);box-shadow:0 1px 2px rgba(9,9,11,.16)}.btn.primary:hover{background:#27272a;border-color:#27272a}.btn.secondary{background:var(--secondary);color:var(--secondary-foreground);border-color:transparent;box-shadow:none}.btn.secondary:hover{background:#e4e4e7;color:var(--secondary-foreground)}.btn.ghost{background:transparent;border-color:transparent;box-shadow:none}.btn.ghost:hover{background:var(--accent);color:var(--accent-foreground)}.btn.danger{background:var(--destructive);color:var(--destructive-foreground);border-color:var(--destructive);box-shadow:0 1px 2px rgba(220,38,38,.22)}.btn.danger:hover{background:#b91c1c;border-color:#b91c1c;color:var(--destructive-foreground)}.btn:disabled{opacity:.5;cursor:not-allowed}.x{width:34px;padding:0;border-radius:calc(var(--radius) - 2px);box-shadow:none;border-color:transparent;background:transparent}.x svg{width:17px;height:17px}
        .body{flex:1;overflow:auto;padding:18px 20px 22px}.body::-webkit-scrollbar,.tablewrap::-webkit-scrollbar,.pgrid::-webkit-scrollbar,.flowbox::-webkit-scrollbar,.flowwrap::-webkit-scrollbar{width:10px;height:10px}.body::-webkit-scrollbar-thumb,.tablewrap::-webkit-scrollbar-thumb,.pgrid::-webkit-scrollbar-thumb,.flowbox::-webkit-scrollbar-thumb,.flowwrap::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:999px;border:2px solid transparent;background-clip:padding-box}.foot{height:30px;flex:0 0 30px;border-top:1px solid var(--border);background:var(--card);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:var(--muted-foreground)}.foot a{color:var(--foreground);text-decoration:none;font-weight:600}.foot a:hover{text-decoration:underline}.loading,.empty{min-height:132px;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:36px;text-align:center;color:var(--muted-foreground);font-size:13px}.spinner{width:28px;height:28px;border:3px solid #e4e4e7;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px}@keyframes spin{to{transform:rotate(360deg)}}
        .meta{margin-bottom:14px}.meta h2{font-size:18px;margin:0 0 4px}.meta p{margin:0;color:var(--muted-foreground);font-family:var(--mono);font-size:12px;word-break:break-word}
        .scanwrap{display:block}.scanhead{margin:0 0 12px}.scantitle{font-size:20px;line-height:1.25;margin:2px 0 0;font-weight:650;letter-spacing:0}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted-foreground);font-weight:600}
        .tabs{display:inline-flex;max-width:100%;gap:3px;background:var(--muted);border:1px solid var(--border);border-radius:calc(var(--radius) + 2px);margin:0 0 14px;padding:4px;overflow:auto}.tab{height:34px;border:0;background:transparent;color:var(--muted-foreground);border-radius:calc(var(--radius) - 2px);padding:0 10px;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;flex:none}.tab:hover{color:var(--foreground);background:rgba(255,255,255,.55)}.tab.active{color:var(--foreground);background:var(--card);box-shadow:0 1px 2px rgba(9,9,11,.08)}.tabicon{width:15px;height:15px;flex:none}.tabcount{font-family:var(--mono);font-size:11px;color:var(--muted-foreground)}
        .filter,.select,.orginput,.orgtextarea{width:100%;border:1px solid var(--input);border-radius:calc(var(--radius) - 2px);background:var(--card);color:var(--foreground);box-shadow:0 1px 1px rgba(9,9,11,.02)}.filter{height:38px;padding:0 12px;margin-bottom:14px;font-size:13px}.filter::placeholder{color:var(--muted-foreground)}.select{height:34px;padding:0 34px 0 10px;font-size:13px;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-size:14px 14px;background-position:right 10px center}
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(144px,1fr));gap:12px;margin:12px 0 16px}.stat,.panel,.pcard,.reason{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 1px 2px rgba(9,9,11,.03)}.stat{padding:14px}.num{font-family:var(--mono);font-size:25px;line-height:1.1;font-weight:750;letter-spacing:0}.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-foreground);font-weight:600;margin-top:7px}.panel{padding:15px;margin-bottom:14px}.panelh{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .bars{display:grid;gap:9px}.bar{display:grid;grid-template-columns:minmax(110px,180px) 1fr 76px;gap:10px;align-items:center}.barlab{font-family:var(--mono);font-size:12px;color:var(--foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track{height:10px;background:var(--muted);border-radius:999px;overflow:hidden}.fill{height:100%;background:var(--chart);border-radius:999px}.val{text-align:right;color:var(--muted-foreground);font-family:var(--mono);font-size:12px;white-space:nowrap}.barhint{margin-top:10px;color:var(--muted-foreground);font-size:12px;line-height:1.4}
        .tablewrap{max-height:55vh;overflow:auto;border:1px solid var(--border);border-radius:var(--radius);background:var(--card)}table{width:100%;border-collapse:collapse;font-family:var(--mono);font-size:12px}th{position:sticky;top:0;background:var(--card);text-align:left;color:var(--muted-foreground);font-size:10px;text-transform:uppercase;letter-spacing:.06em;padding:10px 12px;border-bottom:1px solid var(--border);font-weight:700}td{padding:10px 12px;border-bottom:1px solid #f4f4f5;vertical-align:top}tr:hover td{background:#fafafa}.mut{color:var(--muted-foreground)}.url{color:#2563eb;text-decoration:none;max-width:360px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.url:hover{text-decoration:underline}.datecell{display:inline-block;min-width:86px;white-space:nowrap;font-variant-numeric:tabular-nums}
        .querylist,.savedlist{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--card)}.querylist{overflow:auto;max-height:260px}.queryrow{display:grid;grid-template-columns:46px minmax(150px,210px) minmax(0,1fr);gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #f4f4f5}.queryrow:last-child{border-bottom:0}.queryrow:hover{background:#fafafa}.qnum,.qvia{font-family:var(--mono);font-size:11px}.qnum{color:var(--muted-foreground);font-variant-numeric:tabular-nums}.qvia{color:#52525b;background:var(--secondary);border:1px solid var(--border);border-radius:999px;padding:3px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qvia.product{background:#f5f3ff;border-color:#ddd6fe;color:#6d28d9}.qtext{font-size:13px;line-height:1.35;color:var(--foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .savedhead,.savedrow{display:grid;grid-template-columns:minmax(260px,1.4fr) 150px minmax(220px,.9fr) minmax(180px,.75fr) auto;gap:12px;align-items:center}.savedhead{padding:10px 12px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);background:#fafafa;font-weight:700}.savedrow{padding:10px 12px;border-bottom:1px solid #f4f4f5}.savedrow:last-child{border-bottom:0}.savedrow:hover{background:#fafafa}.savedtitle{font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.savedmeta,.savedstats{font-family:var(--mono);font-size:12px;color:var(--muted-foreground)}.savedmeta{white-space:nowrap}.savedstats{display:flex;gap:12px;flex-wrap:wrap}.savedstats b{color:var(--foreground);font-weight:650}.savedacts{display:flex;gap:6px;justify-content:flex-end}.savedacts .btn{height:30px;padding:0 9px;font-size:12px}
        .savedbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}.savedfilters,.savedtools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.savedorg{display:flex;flex-direction:column;gap:6px;min-width:0;align-items:flex-start}.savedorg .select.inline{height:30px;width:auto;max-width:220px;padding:0 26px 0 8px;font-size:12px;font-weight:500;border-color:transparent;background-color:transparent;box-shadow:none;background-position:right 7px center;cursor:pointer}.savedorg .select.inline:hover,.savedorg .select.inline:focus-visible{border-color:var(--input);background-color:var(--card)}.savedorg .select.inline.noproject{color:var(--muted-foreground);font-weight:400}.tagline{display:flex;gap:5px;flex-wrap:wrap;align-items:center}.addtag{display:inline-flex;align-items:center;border:1px dashed var(--border);background:transparent;color:var(--muted-foreground);border-radius:999px;padding:2px 8px;font-family:var(--mono);font-size:10.5px;font-weight:600;cursor:pointer;line-height:1.4}.addtag:hover{color:var(--foreground);border-style:solid;border-color:#d4d4d8;background:var(--card)}.tagchip,.orgchip,.pill,.rchip,.rbadge{display:inline-flex;align-items:center;border-radius:999px}.tagchip{padding:2px 8px;font-family:var(--mono);font-size:10.5px;font-weight:650}.notes{font-size:12px;color:#52525b;line-height:1.35;max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.importfile{display:none}
        .orgshade{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(9,9,11,.42);padding:24px}.orgmodal{width:min(600px,calc(100vw - 56px));max-height:min(720px,calc(100vh - 80px));overflow:auto;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:calc(var(--radius) + 2px);box-shadow:0 24px 70px rgba(9,9,11,.26);padding:18px}.orgmodal.wide{width:min(760px,calc(100vw - 56px))}.orghead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}.orgtitle{font-size:16px;font-weight:650;margin:0}.orgsub{font-size:12px;color:var(--muted-foreground);margin-top:4px;line-height:1.45}.orggrid{display:grid;gap:14px}.orgfield{display:grid;gap:6px}.orgfield label{font-size:12px;font-weight:600;color:var(--foreground)}.orginput{height:36px;padding:0 10px;font-size:13px}.orgtextarea{min-height:86px;resize:vertical;padding:9px 10px;font-size:13px;line-height:1.4}.orgcolor{width:48px;height:34px;border:1px solid var(--input);border-radius:calc(var(--radius) - 2px);background:var(--card);padding:3px;cursor:pointer}.orgrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.orgrow.tags{grid-template-columns:minmax(0,1fr) auto 48px}.orghint,.orgstatus,.managecount,.small{font-family:var(--mono);font-size:11px;color:var(--muted-foreground);line-height:1.4}.orgchips{display:flex;gap:6px;flex-wrap:wrap;min-height:26px}.orgchip{gap:6px;padding:4px 8px;font-family:var(--mono);font-size:11px;font-weight:650}.orgchip button{border:0;background:transparent;color:inherit;cursor:pointer;padding:0;font:inherit;opacity:.75}.orgactions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.managebody{display:grid;gap:18px}.managesec{display:grid;gap:8px}.managerow{display:grid;grid-template-columns:minmax(0,1fr) 84px auto auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f4f4f5}.managerow:last-child{border-bottom:0}.managerow.tag{grid-template-columns:minmax(0,1fr) 48px 84px auto auto}.managecount{text-align:right}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.pgrid{display:flex;align-items:flex-start;gap:14px;overflow-x:auto;overflow-y:visible;scroll-snap-type:x proximity;padding:2px 2px 18px;scrollbar-width:thin;scrollbar-color:#d4d4d8 transparent}.pgrid .pcard{flex:0 0 372px;width:372px;scroll-snap-align:start}.pcard{padding:12px;display:flex;flex-direction:column;gap:8px;min-width:0}.thumblink{display:block;text-decoration:none}.thumb{height:170px;width:100%;object-fit:contain;border:1px solid #f4f4f5;border-radius:calc(var(--radius) - 2px);background:#fafafa}.ptitle{font-weight:650;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.plink{color:inherit;text-decoration:none}.plink:hover{text-decoration:underline}.price{font-family:var(--mono);font-size:17px;font-weight:750}.ratingline{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--muted-foreground)}.ratingstar{width:14px;height:14px;display:inline-block;flex:none}.pill{align-self:flex-start;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;padding:2px 8px;font-family:var(--mono);font-size:10px}.desc{font-size:12px;color:#52525b;line-height:1.4;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.gmeta{display:grid;gap:3px;border-top:1px solid #f4f4f5;padding-top:7px}.gmrow{font-family:var(--mono);font-size:10.5px;color:var(--muted-foreground);line-height:1.35;white-space:normal;overflow-wrap:anywhere}.gmrow b{color:#52525b;font-weight:650}.sourcelink{display:inline-block;color:var(--muted-foreground);text-decoration:none}.sourcelink:hover{text-decoration:underline;color:#2563eb}.shoppinglink{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;color:#1a73e8;text-decoration:none;font-family:var(--mono);font-size:11px;font-weight:650;line-height:1.2;padding:5px 8px 5px 6px;border:1px solid #dbeafe;border-radius:6px;background:#fff}.shoppinglink:hover{background:#eff6ff;border-color:#bfdbfe;color:#174ea6;text-decoration:none}.gshopicon{width:15px;height:17px;flex:none}.offerbtn{height:28px;align-self:flex-start;padding:0 9px;font-family:var(--mono);font-size:11px}.offerbtn svg{width:13px;height:13px}.offerlink{display:block;color:inherit;text-decoration:none}.offer{border-top:1px solid #f4f4f5;padding-top:7px;font-family:var(--mono);font-size:11px;display:flex;justify-content:space-between;gap:8px}.offerlink:hover .offer{background:#fafafa}.offer.best{color:#15803d;font-weight:700}.offer span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.offer strong{white-space:nowrap}.bestmark{color:var(--success);margin-right:4px}.insightcard{border-top:1px solid #f4f4f5;padding-top:8px;display:block}.insightcard summary{cursor:pointer;list-style:none;border:1px solid var(--border);border-radius:var(--radius);background:#fafafa;padding:9px 10px;display:grid;gap:7px}.insightcard summary::-webkit-details-marker{display:none}.insighttop{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.insightlabel{font-size:12px;color:#27272a;font-weight:750}.insightaction{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10.5px;color:#52525b;white-space:nowrap}.insightaction:before{content:'Show details'}.insightaction:after{content:'+';font-size:13px;color:#71717a}.insightcard[open] .insightaction:before{content:'Hide details'}.insightcard[open] .insightaction:after{content:'-'}.insightchips{display:flex;flex-wrap:wrap;gap:4px 14px}.insightchip{display:inline-flex;align-items:center;max-width:100%;background:transparent;border:0;border-radius:0;padding:0;font-size:12px;font-weight:650;color:#52525b;min-width:0}.insightchip strong{font-weight:inherit;color:inherit;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.insightchip.positive{color:#15803d}.insightchip.negative{color:#b91c1c}.insightchip.neutral{color:#52525b}.insightchip.muted{color:var(--muted-foreground);font-weight:500}.senticon{width:14px;height:14px;flex:none;color:currentColor}.insightbody{display:grid;gap:10px;padding:10px 2px 0}.insighttitle{font-size:12px;color:#27272a;font-weight:700}.insighttext{font-size:12px;line-height:1.42;color:#3f3f46}.sentwrap{display:grid;gap:7px}.sentbar{display:flex;gap:3px;height:6px}.sentbar i{display:block;height:100%;flex-basis:0;min-width:10px;border-radius:999px}.sent-positive{background:#16a34a}.sent-neutral{background:#c4c4cc}.sent-negative{background:#dc2626}.sentlegend{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:10.5px;color:#3f3f46}.sentitem{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.sentitem b{font-weight:750}.sentdot{width:7px;height:7px;border-radius:50%;flex:none}.senttotal{margin-left:auto;color:var(--muted-foreground)}.reviewsources{display:flex;flex-direction:column}.reviewsources .insighttitle{padding-bottom:4px}.reviewrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:8px 2px;margin:0 -2px;color:inherit;text-decoration:none;border-radius:6px}.reviewrow+.reviewrow{border-top:1px solid #f4f4f5}a.reviewrow:hover{background:#fafafa}a.reviewrow:hover .reviewname{color:#2563eb}.reviewrowmain{display:grid;gap:2px;min-width:0}.reviewname{font-size:12.5px;font-weight:650;color:#27272a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .1s}.reviewmeta{font-size:11px;line-height:1.35;color:var(--muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.senttag{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10.5px;color:#52525b;white-space:nowrap}.senttag .senticon{width:15px;height:15px}.senttag.positive{color:#166534}.senttag.negative{color:#991b1b}.senttag.neutral{color:#52525b}
        .panelhleft{display:flex;align-items:center;gap:14px;flex-wrap:wrap;min-width:0}.marketgroup{display:inline-flex;align-items:stretch;height:34px;border:1.5px solid var(--foreground);border-radius:9px;background:#fff;box-shadow:0 1px 2px rgba(9,9,11,.08)}.marketgroup .mgl{display:inline-flex;align-items:center;padding:0 10px;background:var(--foreground);color:#fafafa;font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;border-radius:6px 0 0 6px;user-select:none}.marketgroup .mselect{display:flex}.marketgroup .mtrigger{height:auto;border:0;border-radius:0;background:transparent;padding:0 10px}.marketgroup .mselect+.mselect .mtrigger{border-left:1px solid var(--border)}.marketgroup .mtrigger:hover{background:#fafafa;border-color:transparent;box-shadow:none}.marketgroup .mtrigger:focus-visible,.marketgroup .mselect.open .mtrigger{border-color:transparent;box-shadow:inset 0 0 0 2px rgba(24,24,27,.16);background:#fafafa}.marketinfo{display:inline-flex;align-items:center;justify-content:center;padding:0 9px;border:0;border-left:1px solid var(--border);background:transparent;color:#a1a1aa;cursor:help;border-radius:0 6px 6px 0}.marketinfo:hover,.marketinfo:focus-visible{color:#3f3f46;background:#fafafa;outline:none}.marketinfo svg{width:15px;height:15px}.loadingline{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;color:#2563eb;margin-bottom:10px}.mselect{position:relative}.mtrigger{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 9px 0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;cursor:pointer;font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--foreground);transition:border-color .12s,box-shadow .12s,background .12s}.mtrigger:hover{border-color:#d4d4d8;background:#fafafa}.mtrigger:focus-visible{outline:none;border-color:#a1a1aa;box-shadow:0 0 0 3px rgba(24,24,27,.08)}.mselect.open .mtrigger{border-color:#a1a1aa;box-shadow:0 0 0 3px rgba(24,24,27,.08);background:#fff}.mflag{display:inline-flex;align-items:center;flex:none;line-height:0}.mflag svg{width:19px;height:12.5px;border-radius:2.5px;box-shadow:inset 0 0 0 .5px rgba(9,9,11,.14)}.mlang{font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.04em;color:#52525b;background:var(--secondary);border-radius:4px;padding:2px 4px;line-height:1.2}.mtriglabel{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mtrigcode{font-family:var(--mono);font-size:9.5px;font-weight:700;color:var(--muted-foreground)}.mchevron{width:14px;height:14px;flex:none;color:var(--muted-foreground);transition:transform .15s}.mselect.open .mchevron{transform:rotate(180deg)}.mpop{position:absolute;top:calc(100% + 6px);left:0;z-index:60;min-width:236px;max-height:300px;display:none;flex-direction:column;background:var(--popover);border:1px solid var(--border);border-radius:10px;box-shadow:0 12px 32px -8px rgba(0,0,0,.16),0 4px 12px -6px rgba(0,0,0,.1);overflow:hidden}.mselect.open .mpop{display:flex;animation:mpopin .12s ease}@keyframes mpopin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}.mpopsearch{flex:none;height:36px;width:100%;border:0;border-bottom:1px solid var(--border);padding:0 12px;font-family:var(--sans);font-size:12.5px;color:var(--foreground);background:transparent}.mpopsearch:focus{outline:none}.mpopsearch::placeholder{color:var(--muted-foreground)}.mpoplist{overflow-y:auto;padding:5px;display:flex;flex-direction:column;gap:1px;scrollbar-width:thin}.mopt{display:grid;grid-template-columns:24px minmax(0,1fr) auto 16px;align-items:center;gap:8px;width:100%;border:0;background:transparent;border-radius:7px;padding:7px 8px;font-family:var(--sans);font-size:12.5px;color:var(--foreground);cursor:pointer;text-align:left}.mopt.nocode{grid-template-columns:24px minmax(0,1fr) 16px}.mopt:hover,.mopt.active{background:var(--secondary)}.mopt.selected{font-weight:650}.moptlabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.moptcode{font-family:var(--mono);font-size:10px;color:var(--muted-foreground)}.mcheck{width:14px;height:14px;color:#16a34a;justify-self:end}.mempty{padding:14px 12px;font-size:12px;color:var(--muted-foreground);text-align:center}.cachenote{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:var(--radius);padding:9px 12px;margin-bottom:12px;font-size:12px;color:#854d0e}.producthint{font-family:var(--mono);font-size:11px;color:var(--muted-foreground);margin:-6px 0 10px;line-height:1.45}.rchips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.rchip{font-family:var(--mono);font-size:11px;color:var(--muted-foreground);background:var(--card);border:1px solid var(--border);padding:4px 10px}.rchip b{color:var(--foreground);margin-right:2px}.rnote{font-size:12px;color:#52525b;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:var(--radius);padding:9px 11px;margin-bottom:12px;line-height:1.5}.rsteps{display:grid;gap:7px}.rstep{display:flex;align-items:flex-start;gap:10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);padding:9px 11px}.rstep-blocked{border-color:#fecaca;background:#fef2f2}.rbadge{flex:none;font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;margin-top:1px;color:#fff;background:#71717a}.rbadge-search{background:#0f766e}.rbadge-open{background:#2563eb}.rbadge-find{background:#7c3aed}.rbadge-click{background:#71717a}.rbadge-quote{background:#16a34a}.rbadge-other{background:#52525b}.rbadge-blocked{background:#dc2626}.rstepbody{min-width:0;flex:1}.rmain{display:block;font-family:var(--mono);font-size:11.5px;color:var(--foreground);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}a.rmain:hover{text-decoration:underline;color:#2563eb}.rmeta{font-family:var(--mono);font-size:10.5px;color:var(--muted-foreground);margin-top:2px;line-height:1.45}.rstep-blocked .rmeta{color:#b91c1c}.rcensus{margin-top:18px;border-top:1px solid var(--border);padding-top:12px}.rcensus>summary{cursor:pointer;margin-bottom:8px}.rcensus>.rstep{margin-bottom:6px}.rquote{border-left:3px solid #d4d4d8;background:var(--card);border-radius:0 var(--radius) var(--radius) 0;padding:9px 12px;margin-bottom:8px;font-size:12px;color:#3f3f46;line-height:1.5}.dotspin{width:12px;height:12px;border:2px solid #e4e4e7;border-top-color:#2563eb;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
        .cmpstats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0 4px}.cmpstat{border:1px solid var(--border);border-radius:var(--radius);background:var(--card);padding:11px 12px;box-shadow:0 1px 2px rgba(9,9,11,.03)}.cmpnum{font-family:var(--mono);font-size:21px;font-weight:750;line-height:1.1}.cmplbl{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);font-weight:600;margin-top:5px}.cmptrack{height:6px;background:var(--muted);border-radius:999px;margin-top:9px;overflow:hidden}.cmpfill{height:100%;border-radius:999px;background:var(--chart)}.cmproute{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:12px;margin:12px 0 2px;border:1px solid var(--border);border-radius:999px;background:var(--card);padding:6px 7px 6px 13px;box-shadow:0 1px 2px rgba(9,9,11,.04)}.routearrow{width:16px;height:16px;color:#a1a1aa;flex:none}.routediv{width:1px;height:16px;background:var(--border);margin:0 3px;flex:none}.routestatus{font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:4px 9px;border:1px solid;line-height:1}.routestatus.stable{background:#f0fdf4;color:#15803d;border-color:#bbf7d0}.routestatus.changed{background:#fef2f2;color:#b91c1c;border-color:#fecaca}.cmpresults{display:grid;gap:14px;margin-top:18px}.cmpresults .cmproute{margin:0;justify-self:start}.cmpresults .rnote{margin-bottom:0}.cmpresults .cmpstats{margin:0}.cmpresults .cmpcols{margin-top:0}.cmpresults .cmpsec{margin-top:0}.pipedot{width:9px;height:9px;border-radius:50%;flex:none}.cmpcols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.cmpcard{border:1px solid var(--border);border-radius:var(--radius);background:var(--card);padding:12px;box-shadow:0 1px 2px rgba(9,9,11,.03)}.cmpcard .eyebrow{display:block;margin-bottom:8px}.mixbar{display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--muted);margin-bottom:8px}.mixseg{height:100%}.mixlegend{display:flex;flex-wrap:wrap;gap:5px 12px;font-family:var(--mono);font-size:11px;color:var(--muted-foreground)}.cmpcounts{font-family:var(--mono);font-size:11px;color:var(--muted-foreground);margin-top:9px;padding-top:8px;border-top:1px solid #f4f4f5}.cmpcounts b{color:var(--foreground)}.cmpsec{margin-top:14px}.cmpsec>.eyebrow{display:block;margin-bottom:7px}.domscroll{max-height:206px;overflow-y:auto;overflow-x:hidden;padding-right:4px}.domlist{columns:3 170px;column-gap:20px;font-family:var(--mono);font-size:11px;line-height:1.95;color:#52525b;padding:2px 0}.domlist span{display:block;break-inside:avoid;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.domlist span.shared{color:var(--foreground);font-weight:650}.domlist span.more{color:var(--muted-foreground);font-style:italic}
        .flowtools,.flowacts{display:flex;gap:8px;flex-wrap:wrap}.flowbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}.flowlegend{display:flex;flex-wrap:wrap;gap:7px 14px}.lg{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--muted-foreground)}.lg i{display:inline-block;width:9px;height:9px;border-radius:50%;flex:none}.exportmenu{position:relative}.exportmenu summary{list-style:none;display:inline-flex;align-items:center;gap:6px}.exportmenu summary::-webkit-details-marker{display:none}.chev{width:13px;height:13px;transition:transform .16s ease}.exportmenu[open] .chev{transform:rotate(180deg)}.exportitems{position:absolute;right:0;top:calc(100% + 6px);z-index:5;width:178px;border:1px solid var(--border);border-radius:var(--radius);background:var(--popover);box-shadow:0 12px 30px rgba(9,9,11,.14);padding:5px}.exportitem{display:block;width:100%;border:0;background:transparent;color:var(--popover-foreground);text-align:left;border-radius:calc(var(--radius) - 2px);padding:8px 9px;cursor:pointer;font-size:13px}.exportitem:hover{background:var(--accent)}.flowbox,.flowwrap{overflow-y:auto;overflow-x:hidden;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);padding:8px}.flowbox svg,.flowwrap svg{display:block;width:100%;height:auto}
        .reason{padding:12px;margin-bottom:8px}.reason b{font-size:13px}.reason pre{white-space:pre-wrap;font-family:var(--mono);font-size:11.5px;color:#3f3f46;line-height:1.55;margin:8px 0 0}
        @media(max-width:760px){.overlay{padding:0}.grid2{grid-template-columns:1fr}.modal{width:100vw;height:100vh;border-radius:0}.head{align-items:flex-start}.sub{display:none}.body{padding:14px}.acts{justify-content:flex-end}.tabs{display:flex;width:100%}.bar{grid-template-columns:110px 1fr 72px}.queryrow{grid-template-columns:36px 1fr}.qtext{grid-column:1 / -1;white-space:normal}.qvia{min-width:0}.savedbar{align-items:stretch}.savedfilters,.savedtools{width:100%}.savedhead{display:none}.savedrow{grid-template-columns:1fr}.savedacts{justify-content:flex-start}.orgrow,.orgrow.tags,.managerow,.managerow.tag{grid-template-columns:1fr}.orgcolor{width:100%}}
        @media(prefers-reduced-motion:reduce){.spinner,.dotspin{animation:none}}
    `;

    function h(tag, props, ...children) {
        const el = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach((key) => {
                const value = props[key];
                if (value == null) return;
                if (key === 'class') el.className = value;
                else if (key === 'text') el.textContent = value;
                else if (key === 'style') Object.assign(el.style, value);
                else if (key === 'value') el.value = value;
                else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
                else el.setAttribute(key, value);
            });
        }
        children.flat(Infinity).forEach((child) => {
            if (child == null || child === false) return;
            el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
        });
        return el;
    }

    function extensionUrl(path) {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
                return chrome.runtime.getURL(path);
            }
        } catch (_) {
            return path;
        }
        return path;
    }

    function detectedProductMarket() {
        const language = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
        const parts = String(language).toLowerCase().split(/[-_]/);
        const detectedHl = PRODUCT_MARKET_LANGUAGES.some(([code]) => code === parts[0]) ? parts[0] : 'en';
        const detectedGl = PRODUCT_MARKET_COUNTRIES.some(([code]) => code === parts[1]) ? parts[1] : 'us';
        return { gl: detectedGl, hl: detectedHl };
    }

    function normalizeProductMarket(market) {
        const fallback = detectedProductMarket();
        const gl = PRODUCT_MARKET_COUNTRIES.some(([code]) => code === String(market && market.gl || '').toLowerCase())
            ? String(market.gl).toLowerCase()
            : fallback.gl;
        const hl = PRODUCT_MARKET_LANGUAGES.some(([code]) => code === String(market && market.hl || '').toLowerCase())
            ? String(market.hl).toLowerCase()
            : fallback.hl;
        return { gl, hl };
    }

    async function ensureProductMarket() {
        if (state.productMarketLoaded && state.productMarket) return state.productMarket;
        try {
            const settings = await CORE().loadSettings();
            state.productMarket = normalizeProductMarket(settings.productMarket || null);
        } catch (_) {
            state.productMarket = normalizeProductMarket(null);
        }
        state.productMarketLoaded = true;
        return state.productMarket;
    }

    async function setProductMarket(patch) {
        state.productMarket = normalizeProductMarket({ ...(state.productMarket || detectedProductMarket()), ...patch });
        state.productMarketLoaded = true;
        try {
            await CORE().saveSettings({ productMarket: state.productMarket });
            setStatus(`requested market ${productMarketLabel(state.productMarket)} saved`);
        } catch (_) {
            setStatus('requested market changed for this session');
        }
        renderProductState();
    }

    function productMarketLabel(market) {
        const normalized = normalizeProductMarket(market);
        return `${normalized.gl.toUpperCase()}/${normalized.hl.toUpperCase()}`;
    }

    function setStatus(text, isError) {
        if (!state.status) return;
        state.status.textContent = text || '';
        state.status.style.color = isError ? 'var(--red)' : 'var(--mut)';
    }

    function ensureHost() {
        if (state.host && state.overlay) return;
        if (state.host && !state.overlay) {
            state.host.remove();
            state.host = null;
            state.shadow = null;
            state.body = null;
            state.status = null;
        }
        document.getElementById('cgpt-geo-research-host')?.remove();
        state.host = h('div', { id: 'cgpt-geo-research-host' });
        state.host.style.position = 'fixed';
        state.host.style.inset = '0';
        state.host.style.zIndex = '2147483647';
        state.host.style.pointerEvents = 'none';
        state.shadow = state.host.attachShadow({ mode: 'open' });
        const style = h('style', { text: CSS });
        state.shadow.appendChild(style);

        state.status = h('span', { class: 'status' });
        state.body = h('div', { class: 'body' });
        const header = h('div', { class: 'head' },
            h('div', { class: 'brand' }, h('img', { class: 'brandicon', src: extensionUrl('icons/logobubble.svg'), alt: '', 'aria-hidden': 'true' }), h('div', { class: 'brandcopy' }, h('div', { class: 'title' }, 'ChatGPT GEO/AEO Research'), h('div', { class: 'sub', id: 'geo-research-subtitle' }, 'Open a ChatGPT conversation to scan'))),
            h('div', { class: 'acts' },
                state.status,
                h('button', { class: 'btn', onClick: rescan }, 'Rescan'),
                h('button', { class: 'btn primary', onClick: saveCurrent }, 'Save'),
                h('details', { class: 'exportmenu' },
                    h('summary', { class: 'btn' }, 'Export', chevronIcon()),
                    h('div', { class: 'exportitems' },
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); copyJson(); } }, 'Copy JSON'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); copySourcesCsv(); } }, 'Copy Sources CSV'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportJson(); } }, 'Save JSON'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportSourcesCsv(); } }, 'Save Sources CSV'))),
                h('button', { class: 'btn x', 'aria-label': 'Close', onClick: close }, closeIcon())));
        const footer = h('div', { class: 'foot' },
            h('a', { href: 'https://www.martinaberastegue.com', target: '_blank', rel: 'noopener noreferrer', text: 'Martin Aberastegue' }));
        const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, header, state.body, footer);
        state.overlay = h('div', { class: 'overlay' }, modal);
        state.overlay.addEventListener('click', (event) => {
            if (event.target === state.overlay) close();
        });
        state.shadow.addEventListener('click', (event) => {
            const menu = exportMenuFromEvent(event);
            if (menu) setTimeout(() => closeExportMenus(menu), 0);
            else closeExportMenus();
        });
        document.addEventListener('pointerdown', (event) => {
            if (!state.overlay || !state.overlay.classList.contains('open')) return;
            if (!exportMenuFromEvent(event)) closeExportMenus();
        }, true);
        document.addEventListener('focusin', (event) => {
            if (!state.overlay || !state.overlay.classList.contains('open')) return;
            if (!exportMenuFromEvent(event)) closeExportMenus();
        }, true);
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const orgShade = state.shadow && state.shadow.querySelector('.orgshade');
            if (orgShade) {
                const closeButton = orgShade.querySelector('.btn.x');
                if (closeButton) closeButton.click(); else orgShade.remove();
                return;
            }
            const openMenu = state.shadow && state.shadow.querySelector('details.exportmenu[open]');
            closeExportMenus();
            if (!openMenu && state.overlay && state.overlay.classList.contains('open')) close();
        });
        state.shadow.appendChild(state.overlay);
        document.body.appendChild(state.host);
    }

    async function open() {
        ensureHost();
        if (!state.overlay) throw new Error('GEO/AEO Research UI could not initialize. Refresh this ChatGPT tab after reloading the extension.');
        state.overlay.classList.add('open');
        await ensureProductMarket();
        const status = CORE().getPageStatus();
        const conversationId = status.conversationId || '';
        const sameConversation = conversationId && conversationId === state.lastConversationId;
        if (state.intel && sameConversation) {
            render();
            return;
        }
        if (conversationId) {
            const cached = await findCachedSnapshot(conversationId);
            if (cached) {
                loadCachedSnapshot(cached);
                setStatus('loaded saved cache');
                render();
                return;
            }
        }
        await rescan(conversationId);
    }

    function close() {
        if (state.overlay) state.overlay.classList.remove('open');
    }

    async function rescan(targetConversationId) {
        ensureHost();
        const explicitId = typeof targetConversationId === 'string' ? targetConversationId : '';
        const pageId = (CORE().getPageStatus() || {}).conversationId || '';
        const viewedId = state.lastConversationId || (state.intel && state.intel.id) || '';
        const targetId = explicitId || viewedId || pageId;
        state.body.replaceChildren(h('div', { class: 'loading' }, h('div', { class: 'spinner' }), targetId ? `Scanning conversation ${targetId}...` : 'Scanning current ChatGPT conversation...'));
        setStatus('scanning...');
        try {
            const result = targetId ? await CORE().scanConversationById(targetId) : await CORE().scanCurrentConversation();
            state.intel = result.intel;
            state.raw = result.raw;
            state.token = result.token;
            state.lastConversationId = result.intel.id;
            state.fromCache = false;
            state.loadingInsights = false;
            state.offersStarted = false;
            state.offerProgress = '';
            state.insightProgress = '';
            state.openInsights = {};
            state.activeTab = 'overview';
            setStatus('scan complete');
            render();
        } catch (error) {
            state.body.replaceChildren(h('div', { class: 'empty' }, error.message));
            setStatus('scan failed', true);
        }
    }

    async function findCachedSnapshot(conversationId) {
        try {
            const snapshots = await CORE().loadSnapshots();
            return snapshots
                .filter((snapshot) => snapshot.conversationId === conversationId || (snapshot.intel && snapshot.intel.id === conversationId))
                .sort((a, b) => new Date(b.updatedAt || b.scannedAt || 0) - new Date(a.updatedAt || a.scannedAt || 0))[0] || null;
        } catch (_) {
            return null;
        }
    }

    function loadCachedSnapshot(snapshot) {
        state.intel = snapshot.intel || {};
        if (!state.intel.id) state.intel.id = snapshot.conversationId;
        state.raw = null;
        state.token = null;
        state.lastConversationId = snapshot.conversationId || state.intel.id || '';
        state.fromCache = true;
        state.loadingOffers = false;
        state.loadingInsights = false;
        state.offersStarted = true;
        state.offerProgress = '';
        state.insightProgress = '';
        state.openInsights = {};
        state.activeTab = 'overview';
    }

    function render() {
        if (!state.intel) return;
        const prevFilter = state.body && state.body.querySelector('.filter');
        const filterValue = prevFilter ? prevFilter.value : '';
        const filterFocused = prevFilter && state.shadow && state.shadow.activeElement === prevFilter;
        const prevProductGrid = state.activeTab === 'products' && state.body ? state.body.querySelector('.pgrid') : null;
        const productScrollLeft = prevProductGrid ? prevProductGrid.scrollLeft : null;
        if (state.activeTab === 'browse' && !state.intel.browseActions.length) state.activeTab = 'overview';
        const subtitle = state.shadow.getElementById('geo-research-subtitle');
        if (subtitle) {
            subtitle.replaceChildren(...[
                h('span', { class: 'metaitem' }, h('span', { class: 'metalabel' }, 'Conversation'), h('span', { class: 'metavalue', title: state.intel.id, text: state.intel.id })),
                state.intel.prompt ? h('span', { class: 'metasep' }, '·') : null,
                state.intel.prompt ? h('span', { class: 'metaitem' }, h('span', { class: 'metalabel' }, 'Prompt'), h('span', { class: 'metavalue', title: state.intel.prompt, text: state.intel.prompt })) : null,
            ].filter(Boolean));
        }

        state.body.replaceChildren(
            h('div', { class: 'scanwrap' },
                state.fromCache ? (() => {
                    const pageId = (CORE().getPageStatus() || {}).conversationId || '';
                    const scanId = state.lastConversationId || state.intel.id || '';
                    const mismatch = Boolean(pageId && scanId && pageId !== scanId);
                    return h('div', { class: 'cachenote' },
                        h('span', null,
                            `Loaded from saved cache${state.intel.scannedAt ? ` (${new Date(state.intel.scannedAt).toLocaleString()})` : ''} — live offers are frozen at save time.`,
                            mismatch ? ' This scan belongs to a different chat than the page behind — Rescan updates the saved chat shown here.' : ''),
                        h('span', { style: { display: 'inline-flex', gap: '8px', flex: 'none' } },
                            mismatch ? h('a', { class: 'btn', href: `https://chatgpt.com/c/${scanId}`, title: 'Navigate this tab to the scanned chat (reloads the page)' }, 'Open chat') : null,
                            h('button', { class: 'btn', onClick: rescan }, 'Rescan now')));
                })() : null,
                h('div', { class: 'scanhead' }, h('span', { class: 'eyebrow' }, 'Current scan'), h('h2', { class: 'scantitle', text: state.intel.title })),
                renderTabs(),
                renderFilter(),
                renderActiveTab()));
        if (productScrollLeft != null) {
            const restoreProductScroll = () => {
                const nextProductGrid = state.body && state.body.querySelector('.pgrid');
                if (nextProductGrid) nextProductGrid.scrollLeft = productScrollLeft;
            };
            restoreProductScroll();
            requestAnimationFrame(restoreProductScroll);
        }
        if (filterValue) {
            const nextFilter = state.body.querySelector('.filter');
            if (nextFilter) {
                nextFilter.value = filterValue;
                nextFilter.dispatchEvent(new Event('input'));
                if (filterFocused) { nextFilter.focus(); nextFilter.setSelectionRange(filterValue.length, filterValue.length); }
            }
        }
    }

    function renderOfferState() {
        if (state.activeTab === 'products' || state.activeTab === 'flow') render();
    }

    function renderProductState() {
        if (state.activeTab === 'products' || state.activeTab === 'flow') render();
    }

    function renderTabs() {
        const dr = state.intel && state.intel.deepResearch;
        return h('div', { class: 'tabs' }, TABS.filter(([id]) => {
            if (id === 'browse') return state.intel && state.intel.browseActions.length;
            if (id === 'research') return dr && (dr.steps.length > 0 || dr.isDeepResearch || dr.looksLikeResearch);
            return true;
        }).map(([id, label]) => {
            const count = countForTab(id);
            return h('button', {
                class: `tab${state.activeTab === id ? ' active' : ''}`,
                onClick: () => {
                    state.activeTab = id;
                    render();
                    if (id === 'flow') requestAnimationFrame(render);
                },
            }, tabIcon(id), h('span', { text: label }), count == null ? null : h('span', { class: 'tabcount', text: count }));
        }));
    }

    function tabIcon(id) {
        const icon = svgNode('svg', { class: 'tabicon', viewBox: '0 0 24 24', width: 15, height: 15, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'aria-hidden': 'true' });
        const path = (d, attrs = {}) => icon.appendChild(svgNode('path', Object.assign({ d }, attrs)));
        const circle = (attrs) => icon.appendChild(svgNode('circle', attrs));
        const round = { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
        if (id === 'overview') {
            Object.assign(icon.dataset, { cap: 'square' });
            icon.setAttribute('stroke-linecap', 'square');
            icon.setAttribute('stroke-linejoin', 'round');
            ['M13.6903 19.4567C13.5 18.9973 13.5 18.4149 13.5 17.25C13.5 16.0851 13.5 15.5027 13.6903 15.0433C13.944 14.4307 14.4307 13.944 15.0433 13.6903C15.5027 13.5 16.0851 13.5 17.25 13.5C18.4149 13.5 18.9973 13.5 19.4567 13.6903C20.0693 13.944 20.556 14.4307 20.8097 15.0433C21 15.5027 21 16.0851 21 17.25C21 18.4149 21 18.9973 20.8097 19.4567C20.556 20.0693 20.0693 20.556 19.4567 20.8097C18.9973 21 18.4149 21 17.25 21C16.0851 21 15.5027 21 15.0433 20.8097C14.4307 20.556 13.944 20.0693 13.6903 19.4567Z', 'M13.6903 8.95671C13.5 8.49728 13.5 7.91485 13.5 6.75C13.5 5.58515 13.5 5.00272 13.6903 4.54329C13.944 3.93072 14.4307 3.44404 15.0433 3.1903C15.5027 3 16.0851 3 17.25 3C18.4149 3 18.9973 3 19.4567 3.1903C20.0693 3.44404 20.556 3.93072 20.8097 4.54329C21 5.00272 21 5.58515 21 6.75C21 7.91485 21 8.49728 20.8097 8.95671C20.556 9.56928 20.0693 10.056 19.4567 10.3097C18.9973 10.5 18.4149 10.5 17.25 10.5C16.0851 10.5 15.5027 10.5 15.0433 10.3097C14.4307 10.056 13.944 9.56928 13.6903 8.95671Z', 'M3.1903 19.4567C3 18.9973 3 18.4149 3 17.25C3 16.0851 3 15.5027 3.1903 15.0433C3.44404 14.4307 3.93072 13.944 4.54329 13.6903C5.00272 13.5 5.58515 13.5 6.75 13.5C7.91485 13.5 8.49728 13.5 8.95671 13.6903C9.56928 13.944 10.056 14.4307 10.3097 15.0433C10.5 15.5027 10.5 16.0851 10.5 17.25C10.5 18.4149 10.5 18.9973 10.3097 19.4567C10.056 20.0693 9.56928 20.556 8.95671 20.8097C8.49728 21 7.91485 21 6.75 21C5.58515 21 5.00272 21 4.54329 20.8097C3.93072 20.556 3.44404 20.0693 3.1903 19.4567Z', 'M3.1903 8.95671C3 8.49728 3 7.91485 3 6.75C3 5.58515 3 5.00272 3.1903 4.54329C3.44404 3.93072 3.93072 3.44404 4.54329 3.1903C5.00272 3 5.58515 3 6.75 3C7.91485 3 8.49728 3 8.95671 3.1903C9.56928 3.44404 10.056 3.93072 10.3097 4.54329C10.5 5.00272 10.5 5.58515 10.5 6.75C10.5 7.91485 10.5 8.49728 10.3097 8.95671C10.056 9.56928 9.56928 10.056 8.95671 10.3097C8.49728 10.5 7.91485 10.5 6.75 10.5C5.58515 10.5 5.00272 10.5 4.54329 10.3097C3.93072 10.056 3.44404 9.56928 3.1903 8.95671Z'].forEach((d) => path(d));
        } else if (id === 'flow') {
            circle({ cx: 18.5, cy: 19.5, r: 2.5 }); circle({ cx: 18.5, cy: 9.5, r: 2.5 }); circle({ cx: 5.5, cy: 14.5, r: 2.5 }); circle({ cx: 5.5, cy: 4.5, r: 2.5 }); path('M8 4.5L15.5 9.5L8.5 14.5L16 19.5', round);
        } else if (id === 'queries') {
            path('M11 5L18 5', round); path('M10 10L14.5 14.5', round); path('M5 11L5 18', round); circle({ cx: 6.44444, cy: 6.44444, r: 4.44444 }); circle({ cx: 5, cy: 20, r: 2 }); circle({ cx: 16, cy: 16, r: 2 }); circle({ cx: 20, cy: 5, r: 2 });
        } else if (id === 'sources') {
            icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round'); path('M10.5 8H18.5M10.5 12H13M18.5 12H16M10.5 16H13M18.5 16H16'); path('M7 7.5H6C4.11438 7.5 3.17157 7.5 2.58579 8.08579C2 8.67157 2 9.61438 2 11.5V18C2 19.3807 3.11929 20.5 4.5 20.5C5.88071 20.5 7 19.3807 7 18V7.5Z'); path('M16 3.5H11C10.07 3.5 9.60504 3.5 9.22354 3.60222C8.18827 3.87962 7.37962 4.68827 7.10222 5.72354C7 6.10504 7 6.57003 7 7.5V18C7 19.3807 5.88071 20.5 4.5 20.5H16C18.8284 20.5 20.2426 20.5 21.1213 19.6213C22 18.7426 22 17.3284 22 14.5V9.5C22 6.67157 22 5.25736 21.1213 4.37868C20.2426 3.5 18.8284 3.5 16 3.5Z');
        } else if (id === 'citations') {
            icon.setAttribute('stroke-linecap', 'round'); path('M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591', { 'stroke-linejoin': 'round' }); path('M11 20H17');
        } else if (id === 'products') {
            icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round'); path('M10.5 20.25C10.5 20.6642 10.1642 21 9.75 21C9.33579 21 9 20.6642 9 20.25C9 19.8358 9.33579 19.5 9.75 19.5C10.1642 19.5 10.5 19.8358 10.5 20.25Z'); path('M19 20.25C19 20.6642 18.6642 21 18.25 21C17.8358 21 17.5 20.6642 17.5 20.25C17.5 19.8358 17.8358 19.5 18.25 19.5C18.6642 19.5 19 19.8358 19 20.25Z'); path('M2 3H2.20664C3.53124 3 4.19354 3 4.6255 3.40221C5.05746 3.80441 5.10464 4.46503 5.19902 5.78626L5.45035 9.30496C5.5924 11.2936 5.66342 12.2879 5.96476 13.0961C6.62531 14.8677 8.08229 16.2244 9.89648 16.757C10.7241 17 11.7267 17 13.7317 17C15.8373 17 16.89 17 17.7417 16.7416C19.6593 16.1599 21.1599 14.6593 21.7416 12.7417C22 11.89 22 10.8433 22 8.75C22 8.05222 22 7.70333 21.9139 7.41943C21.72 6.78023 21.2198 6.28002 20.5806 6.08612C20.2967 6 19.9478 6 19.25 6H5.5'); path('M16 10V13M11 10V13');
        } else if (id === 'research') {
            path('M16.1995 2.62118C17.0064 2.153 17.4099 1.91892 17.8053 2.02539C18.2007 2.13186 18.4336 2.53732 18.8995 3.34823L20.3819 5.92852C20.8478 6.73943 21.0807 7.14489 20.9747 7.54225C20.8688 7.93961 20.4653 8.1737 19.6584 8.64188L16.235 10.6282C15.4281 11.0964 15.0247 11.3305 14.6293 11.224C14.2339 11.1175 14.0009 10.7121 13.5351 9.90115L12.0527 7.32085C11.5868 6.50994 11.3539 6.10449 11.4598 5.70713C11.5658 5.30977 11.9692 5.07568 12.7761 4.6075L16.1995 2.62118Z');
            path('M11.5585 6.46075L14.0292 10.7613L10.6058 12.7476C9.79886 13.2157 9.39541 13.4498 9.00001 13.3434C8.60461 13.2369 8.37167 12.8314 7.9058 12.0205L7.41168 11.1604C6.94581 10.3495 6.71288 9.94406 6.81882 9.5467C6.92477 9.14934 7.32822 8.91525 8.13513 8.44707L11.5585 6.46075Z');
            path('M6.91755 10.3003L8.39993 12.8806L5.40444 14.6186C5.00566 14.85 4.80627 14.9657 4.61138 14.9915C4.35152 15.0259 4.08871 14.9551 3.88077 14.7948C3.72482 14.6745 3.6097 14.4741 3.37947 14.0734C3.14923 13.6726 3.03412 13.4722 3.00846 13.2764C2.97425 13.0152 3.04467 12.7511 3.20422 12.5421C3.32389 12.3854 3.52328 12.2697 3.92206 12.0384L6.91755 10.3003Z');
            path('M7.5 22L12 12L16.5 22', round);
        } else if (id === 'browse') {
            icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round'); path('M18.4737 15.5215C18.4795 15.4928 18.5205 15.4928 18.5263 15.5215C18.8302 17.0081 19.9919 18.1698 21.4785 18.4737C21.5072 18.4795 21.5072 18.5205 21.4785 18.5263C19.9919 18.8302 18.8302 19.9919 18.5263 21.4785C18.5205 21.5072 18.4795 21.5072 18.4737 21.4785C18.1698 19.9919 17.0081 18.8302 15.5215 18.5263C15.4928 18.5205 15.4928 18.4795 15.5215 18.4737C17.0081 18.1698 18.1698 17.0081 18.4737 15.5215Z'); path('M3 7.5H20'); path('M12.5 20.5H10.5C6.72876 20.5 4.84315 20.5 3.67157 19.3284C2.5 18.1569 2.5 16.2712 2.5 12.5V10.5C2.5 6.72876 2.5 4.84315 3.67157 3.67157C4.84315 2.5 6.72876 2.5 10.5 2.5H12.5C16.2712 2.5 18.1569 2.5 19.3284 3.67157C20.5 4.84315 20.5 6.72876 20.5 10.5V12.5');
        } else if (id === 'reasoning') {
            icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round'); path('M7 4.5C5.34315 4.5 4 5.84315 4 7.5C4 8.06866 4.15822 8.60037 4.43304 9.0535C3.04727 9.31855 2 10.537 2 12C2 13.463 3.04727 14.6814 4.43304 14.9465M7 4.5C7 3.11929 8.11929 2 9.5 2C10.8807 2 12 3.11929 12 4.5V19.5C12 20.8807 10.8807 22 9.5 22C8.11929 22 7 20.8807 7 19.5C5.34315 19.5 4 18.1569 4 16.5C4 15.9313 4.15822 15.3996 4.43304 14.9465M7 4.5C7 5.31791 7.39278 6.04408 8 6.50018M4.43304 14.9465C4.78948 14.3588 5.34207 13.9032 6 13.6707'); path('M19.25 4.74976L17 6.99976H15M18.5 4.74976C18.5 5.16397 18.8358 5.49976 19.25 5.49976C19.6642 5.49976 20 5.16397 20 4.74976C20 4.33554 19.6642 3.99976 19.25 3.99976C18.8358 3.99976 18.5 4.33554 18.5 4.74976Z'); path('M19.25 19.2498L17 16.9998H15M18.5 19.2498C18.5 18.8355 18.8358 18.4998 19.25 18.4998C19.6642 18.4998 20 18.8355 20 19.2498C20 19.664 19.6642 19.9998 19.25 19.9998C18.8358 19.9998 18.5 19.664 18.5 19.2498Z'); path('M19.25 11.9998H15M18.5 11.9998C18.5 12.414 18.8358 12.7498 19.25 12.7498C19.6642 12.7498 20 12.414 20 11.9998C20 11.5855 19.6642 11.2498 19.25 11.2498C18.8358 11.2498 18.5 11.5855 18.5 11.9998Z');
        } else if (id === 'saved') {
            icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round'); path('M17.4776 9.01106C17.485 9.01102 17.4925 9.01101 17.5 9.01101C19.9853 9.01101 22 11.0294 22 13.5193C22 15.8398 20.25 17.7508 18 18M17.4776 9.01106C17.4924 8.84606 17.5 8.67896 17.5 8.51009C17.5 5.46695 15.0376 3 12 3C9.12324 3 6.76233 5.21267 6.52042 8.03192M17.4776 9.01106C17.3753 10.1476 16.9286 11.1846 16.2428 12.0165M6.52042 8.03192C3.98398 8.27373 2 10.4139 2 13.0183C2 15.4417 3.71776 17.4632 6 17.9273M6.52042 8.03192C6.67826 8.01687 6.83823 8.00917 7 8.00917C8.12582 8.00917 9.16474 8.38194 10.0005 9.01101'); path('M12 21L12 13M12 21C11.2998 21 9.99153 19.0057 9.5 18.5M12 21C12.7002 21 14.0085 19.0057 14.5 18.5');
        }
        return icon;
    }

    function renderFilter() {
        if (!['queries', 'sources', 'citations', 'products', 'browse', 'research', 'reasoning', 'saved'].includes(state.activeTab)) return null;
        return h('input', {
            class: 'filter',
            placeholder: 'filter this view...',
            onInput: (event) => {
                const query = event.target.value.toLowerCase();
                state.body.querySelectorAll('[data-filter-row]').forEach((row) => {
                    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
                });
            },
        });
    }

    function renderActiveTab() {
        switch (state.activeTab) {
            case 'flow': return renderFlow();
            case 'queries': return renderQueries();
            case 'sources': return renderSources();
            case 'citations': return renderCitations();
            case 'products': return renderProducts();
            case 'browse': return renderBrowse();
            case 'research': return renderResearch();
            case 'reasoning': return renderReasoning();
            case 'saved': return renderSaved();
            default: return renderOverview();
        }
    }

    function countForTab(id) {
        const intel = state.intel;
        if (!intel) return null;
        if (id === 'queries') return intel.queries.length;
        if (id === 'sources') return intel.sources.length;
        if (id === 'citations') return intel.citations.length;
        if (id === 'products') return intel.products.length;
        if (id === 'browse') return intel.browseActions.length;
        if (id === 'research') return intel.deepResearch ? intel.deepResearch.steps.length : 0;
        if (id === 'reasoning') return intel.reasoning.length + (intel.memory.length ? intel.memory.length : 0);
        if (id === 'saved') return null;
        return null;
    }

    function stat(value, label) {
        return h('div', { class: 'stat' }, h('div', { class: 'num', text: value }), h('div', { class: 'lbl', text: label }));
    }

    function renderOverview() {
        const stats = state.intel.stats;
        const primaryPipeline = formatPipeline(stats.primaryPipeline);
        const statItems = [
            stat(stats.queries, 'fan-out queries'),
            stats.primaryPipeline ? stat(`${stats.primaryPipelineShare}%`, `primary: ${primaryPipeline}`) : null,
            stat(stats.sources, 'sources'),
            stat(stats.domains, 'domains'),
            stat(stats.citations, 'citations'),
            stat(stats.products, 'products'),
            stats.browseActions ? stat(stats.browseActions, 'browse actions') : null,
            stat(state.intel.reasoning.length, 'reasoning steps'),
            stat(stats.memoryItems, 'memory'),
        ].filter(Boolean);
        return h('div', null,
            h('div', { class: 'stats' }, statItems),
            h('div', { class: 'panel' }, h('div', { class: 'panelh' }, h('span', { class: 'eyebrow' }, 'source pipelines')), renderBars(pipelineCounts(state.intel.sources))),
            h('div', { class: 'grid2' },
                h('div', { class: 'panel' }, h('div', { class: 'panelh' }, h('span', { class: 'eyebrow' }, 'query intent (GEO/AEO stage)')), renderBars(metaCounts(stats.queryStages, STAGE_META, STAGE_ORDER), { total: stats.queries, showPercent: true })),
                h('div', { class: 'panel' }, h('div', { class: 'panelh' }, h('span', { class: 'eyebrow' }, 'fetched source types')), renderBars(metaCounts(stats.sourceCategories, CATEGORY_META), { total: stats.sources, showPercent: true }), h('div', { class: 'barhint' }, 'Domain-based heuristic; citations are tracked separately.'))),
            h('div', { class: 'grid2' },
                h('div', { class: 'panel' }, h('div', { class: 'panelh' }, h('span', { class: 'eyebrow' }, 'top fetched domains')), renderBars(domainCounts(state.intel.sources))),
                h('div', { class: 'panel' }, h('div', { class: 'panelh' }, h('span', { class: 'eyebrow' }, 'top cited domains')), renderBars(domainCounts(state.intel.citations)))));
    }

    function metaCounts(counts, meta, order) {
        const map = counts || {};
        const ordered = order || [];
        return Object.keys(map)
            .map((key) => ({ key, label: (meta[key] && meta[key].label) || (typeof meta[key] === 'string' ? meta[key] : key), value: map[key], color: (meta[key] && meta[key].color) || '#a1a1aa' }))
            .sort((left, right) => {
                const leftIndex = ordered.indexOf(left.key);
                const rightIndex = ordered.indexOf(right.key);
                if (leftIndex !== -1 || rightIndex !== -1) {
                    if (leftIndex === -1) return 1;
                    if (rightIndex === -1) return -1;
                    return leftIndex - rightIndex;
                }
                return right.value - left.value;
            });
    }

    function formatPipeline(value) {
        const pipeline = String(value || '').trim();
        return pipeline && pipeline !== '?' ? pipeline : UNKNOWN_PIPELINE;
    }

    function pipelineCounts(items) {
        const counts = {};
        items.forEach((item) => {
            const pipeline = formatPipeline(item.pipeline);
            counts[pipeline] = (counts[pipeline] || 0) + 1;
        });
        return Object.keys(counts).map((label) => ({ label, value: counts[label], color: pipelineColor(label) })).sort((a, b) => b.value - a.value);
    }

    function domainCounts(items) {
        const counts = {};
        items.forEach((item) => {
            const domain = item.domain || CORE().cleanDomain(item.url) || '?';
            counts[domain] = counts[domain] || { value: 0, pipelines: {} };
            counts[domain].value += 1;
            const pipeline = formatPipeline(item.pipeline);
            counts[domain].pipelines[pipeline] = (counts[domain].pipelines[pipeline] || 0) + 1;
        });
        return Object.keys(counts).map((domain) => {
            const pipelines = counts[domain].pipelines;
            const topPipeline = Object.keys(pipelines).sort((a, b) => pipelines[b] - pipelines[a])[0];
            return { label: domain, value: counts[domain].value, color: topPipeline ? pipelineColor(topPipeline) : '#868e96' };
        }).sort((a, b) => b.value - a.value).slice(0, 12);
    }

    function renderBars(items, options) {
        if (!items.length) return h('div', { class: 'empty' }, 'nothing captured');
        const config = options || {};
        const total = Number(config.total) || items.reduce((sum, item) => sum + item.value, 0);
        const max = Math.max(...items.map((item) => item.value));
        return h('div', { class: 'bars' }, items.map((item) => h('div', { class: 'bar' },
            h('div', { class: 'barlab', title: item.label, text: item.label }),
            h('div', { class: 'track' }, h('div', { class: 'fill', style: { width: `${Math.max(4, item.value / max * 100)}%`, background: item.color || 'var(--accent)' } })),
            h('div', { class: 'val', text: config.showPercent && total ? `${item.value} · ${Math.round(item.value / total * 100)}%` : item.value }))));
    }

    function renderQueryChips() {
        if (!state.intel.queries.length) return h('div', { class: 'empty' }, 'no fan-out queries captured');
        return h('div', { class: 'querylist' }, state.intel.queries.map((query, index) => {
            const isProduct = /product/i.test(query.via || '');
            return h('div', { class: 'queryrow' },
                h('div', { class: 'qnum', text: `#${index + 1}` }),
                h('div', { class: `qvia${isProduct ? ' product' : ''}`, title: query.via, text: compactVia(query.via) }),
                h('div', { class: 'qtext', title: query.query, text: query.query }));
        }));
    }

    function compactVia(value) {
        const text = String(value || 'unknown');
        return text
            .replace(/^metadata\./, '')
            .replace(/^web\./, '')
            .replace(/^product_query\./, 'product.');
    }

    function renderQueries() {
        return table(['#', 'fan-out query', 'stage', 'type', 'found via'], state.intel.queries.map((query, index) => [
            index + 1,
            query.query,
            query.stage ? h('span', { style: { color: (STAGE_META[query.stage] || {}).color || 'inherit', fontWeight: '650' }, text: (STAGE_META[query.stage] || {}).label || query.stage }) : '',
            query.qtype ? (QTYPE_META[query.qtype] || query.qtype) : '',
            query.via,
        ]));
    }

    function renderFlow() {
        const available = Math.max(680, Math.floor((state.body && state.body.clientWidth ? state.body.clientWidth : window.innerWidth * 0.88) - 72));
        const flow = drawFlowSvg(available);
        const box = h('div', { class: 'flowbox' }, flow);
        const pipeKeys = orderedPipelineKeys();
        const hasProducts = state.intel.products.length > 0;
        return h('div', null,
            h('div', { class: 'flowbar' },
                h('div', { class: 'flowlegend' },
                    pipeKeys.map((key) => h('span', { class: 'lg' }, h('i', { style: { background: pipelineColor(key) } }), key)),
                    hasProducts ? h('span', { class: 'lg' }, h('i', { style: { background: '#6741D9' } }), 'product query') : null,
                    h('span', { class: 'lg' }, h('i', { style: { background: 'transparent', border: '2px solid #17191f', width: '10px', height: '10px' } }), 'cited'),
                    hasProducts ? h('span', { class: 'lg' }, h('i', { style: { background: '#0CA678' } }), 'best price') : null),
                h('div', { class: 'flowtools' },
                    state.intel.products.some((product) => product.lookupKey) ? h('button', { class: 'btn', disabled: state.loadingOffers ? 'disabled' : null, onClick: () => hydrateOffers({ force: true }) }, state.loadingOffers ? 'Loading offers...' : (state.intel.products.some((product) => product.offers && product.offers.length) ? 'Reload offers' : 'Load offers')) : null,
                    h('details', { class: 'exportmenu' },
                        h('summary', { class: 'btn' }, 'Export', chevronIcon()),
                        h('div', { class: 'exportitems' },
                            h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); copyFlowSvg(flow); } }, 'Copy SVG'),
                            h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); copyFlowPng(flow); } }, 'Copy PNG'),
                            h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); download(`${state.intel.id}-flow.svg`, serializeSvg(flow), 'image/svg+xml'); } }, 'Save SVG'),
                            h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); saveFlowPng(flow); } }, 'Save PNG'))))),
            state.loadingOffers ? h('div', { class: 'loadingline' }, h('span', { class: 'dotspin' }), state.offerProgress || 'loading live offers...') : null,
            box);
    }

    function drawFlowSvg(availW) {
        const intel = state.intel;
        const sources = intel.sources || [];
        const citations = intel.citations || [];
        const products = intel.products || [];
        const hasProducts = products.length > 0;
        const queries = intel.queries || [];
        const width = Math.max(900, Math.floor(availW || 1120));
        const NHMIN = 27;
        const NHMINW = 52;
        const LINE = 14.5;
        const PADY = 6;
        const PADX = 10;
        const CHARW = 6.55;
        const GAP = 9;
        const GGAP = 18;
        const TOP = 50;
        const BANDGAP = 62;
        const M = 6;
        const GAPC = Math.max(16, Math.round(width * 0.018));
        const hubW = 82;
        const usable = width - 2 * M - 4 * GAPC - hubW;
        let promptW = Math.max(96, Math.round(usable * 0.15));
        let queryW = Math.max(118, Math.round(usable * 0.19));
        let midW = Math.max(118, Math.round(usable * 0.17));
        let endW = Math.max(220, usable - promptW - queryW - midW);
        const used0 = 2 * M + hubW + 4 * GAPC + promptW + queryW + midW + endW;
        if (used0 > width) {
            const total = promptW + queryW + midW + endW;
            const factor = Math.max(0.6, (total - (used0 - width)) / total);
            promptW = Math.floor(promptW * factor);
            queryW = Math.floor(queryW * factor);
            midW = Math.floor(midW * factor);
            endW = Math.floor(endW * factor);
        }
        const xPrompt = M;
        const xQuery = xPrompt + promptW + GAPC;
        const xHub = xQuery + queryW + GAPC;
        const xMid = xHub + hubW + GAPC;
        const xEnd = xMid + midW + GAPC;
        const rightEdge = xEnd + endW;
        const innerL = (rightEdge - xMid) - 2 * GAPC;
        const lqW = Math.max(110, Math.round(innerL * 0.28));
        const lpW = Math.max(150, Math.round(innerL * 0.29));
        const loW = Math.max(190, innerL - lqW - lpW);
        const xLQ = xMid;
        const xLP = xLQ + lqW + GAPC;
        const xLO = xLP + lpW + GAPC;
        const pipeKeys = orderedPipelineKeys();

        const wrapLines = (text, maxW) => {
            const value = String(text == null ? '' : text).trim();
            const max = Math.max(4, Math.floor(maxW / CHARW));
            if (!value) return [''];
            const words = value.split(/\s+/);
            const lines = [];
            let cur = '';
            words.forEach((word) => {
                if (word.length > max) {
                    if (cur) {
                        lines.push(cur);
                        cur = '';
                    }
                    let rest = word;
                    while (rest.length > max) {
                        lines.push(rest.slice(0, max));
                        rest = rest.slice(max);
                    }
                    cur = rest;
                } else if (!cur) cur = word;
                else if ((cur + ' ' + word).length <= max) cur += ' ' + word;
                else {
                    lines.push(cur);
                    cur = word;
                }
            });
            if (cur) lines.push(cur);
            return lines.length ? lines : [''];
        };
        const midTrunc = (text, maxChars) => {
            const value = String(text == null ? '' : text);
            if (value.length <= maxChars) return value;
            if (maxChars <= 3) return value.slice(0, Math.max(0, maxChars));
            const head = Math.ceil((maxChars - 1) * 0.62);
            const tail = maxChars - 1 - head;
            return `${value.slice(0, head)}...${value.slice(value.length - tail)}`;
        };
        const fit = (label, right, dot, colW, cap) => {
            const rightW = right ? String(right).length * CHARW + 12 : 0;
            const dotW = dot ? 13 : 0;
            const contentW = PADX * 2 + dotW + String(label == null ? '' : label).length * CHARW + rightW;
            const w = Math.round(Math.min(colW, Math.max(NHMINW, contentW)));
            let lines = wrapLines(label, w - PADX * 2 - dotW - rightW);
            if (cap && lines.length > cap) {
                lines = lines.slice(0, cap);
                lines[cap - 1] = `${lines[cap - 1].slice(0, Math.max(1, lines[cap - 1].length - 3))}...`;
            }
            return { w, lines, h: Math.max(NHMIN, lines.length * LINE + PADY * 2) };
        };
        const fitStack = (label, meta, dot, colW, cap) => {
            const dotW = dot ? 13 : 0;
            const labelText = String(label == null ? '' : label);
            const metaText = String(meta == null ? '' : meta).trim();
            const w = Math.round(Math.max(NHMINW, colW));
            let lines = wrapLines(labelText, w - PADX * 2 - dotW);
            if (cap && lines.length > cap) {
                lines = lines.slice(0, cap);
                lines[cap - 1] = `${lines[cap - 1].slice(0, Math.max(1, lines[cap - 1].length - 3))}...`;
            }
            const metaH = metaText ? LINE + 2 : 0;
            return { w, lines, meta: metaText, h: Math.max(NHMIN + metaH, lines.length * LINE + PADY * 2 + metaH) };
        };
        const fitLine = (label, right, dot, colW) => {
            const rightW = right ? String(right).length * CHARW + 12 : 0;
            const dotW = dot ? 13 : 0;
            const maxChars = Math.max(4, Math.floor((colW - PADX * 2 - dotW - rightW) / CHARW));
            const line = midTrunc(label, maxChars);
            const w = Math.round(Math.min(colW, Math.max(NHMINW, PADX * 2 + dotW + line.length * CHARW + rightW)));
            return { w, lines: [line], h: NHMIN };
        };

        const citedSet = new Set(citations.map((citation) => citation.domain).filter(Boolean));
        const sourceMap = {};
        sources.forEach((source) => {
            const domain = source.domain || '?';
            const pipeline = formatPipeline(source.pipeline);
            sourceMap[domain] = sourceMap[domain] || { n: 0, p: {} };
            sourceMap[domain].n += 1;
            sourceMap[domain].p[pipeline] = (sourceMap[domain].p[pipeline] || 0) + 1;
        });
        let domains = Object.keys(sourceMap).map((domain) => {
            const pipelines = sourceMap[domain].p;
            const top = Object.keys(pipelines).sort((a, b) => pipelines[b] - pipelines[a])[0] || UNKNOWN_PIPELINE;
            return { domain, pipeline: top, n: sourceMap[domain].n, cited: citedSet.has(domain) };
        });
        domains.sort((a, b) => (pipeKeys.indexOf(a.pipeline) - pipeKeys.indexOf(b.pipeline)) || (Number(b.cited) - Number(a.cited)) || (b.n - a.n));
        domains = domains.slice(0, 26);
        const pipesPresent = pipeKeys.filter((key) => domains.some((domain) => domain.pipeline === key));

        const productQSet = new Set();
        products.forEach((product) => {
            if (product.query) productQSet.add(product.query.trim().toLowerCase());
            if (product.title) productQSet.add(product.title.trim().toLowerCase());
        });
        const webQueries = queries.filter((query) => !/product/i.test(query.via || '') && !productQSet.has((query.query || '').trim().toLowerCase()));
        const shownQueries = webQueries.slice(0, 18);
        const moreQueries = webQueries.length - shownQueries.length;
        const qMs = shownQueries.map((query) => ({ query, f: fit(query.query, null, false, queryW, 6) }));
        if (moreQueries > 0) qMs.push({ more: true, f: fit(`+${moreQueries} more fan-out queries`, null, false, queryW) });
        let qTot = 0;
        qMs.forEach((item, index) => {
            qTot += item.f.h;
            if (index < qMs.length - 1) qTot += GAP;
        });

        let yu = 0;
        const domL = [];
        const pipeL = [];
        pipesPresent.forEach((pipeline, groupIndex) => {
            if (groupIndex > 0) yu += GGAP;
            const groupDomains = domains.filter((domain) => domain.pipeline === pipeline);
            const measured = groupDomains.map((domain) => ({ domain, f: fitLine(domain.domain, domain.cited ? 'cited' : (domain.n > 1 ? `x${domain.n}` : ''), true, endW) }));
            let blockH = 0;
            measured.forEach((item, index) => {
                blockH += item.f.h;
                if (index < measured.length - 1) blockH += GAP;
            });
            const pf = fit(`${pipeline} (${groupDomains.length})`, null, false, midW);
            const groupH = Math.max(blockH, pf.h);
            let y = yu + (groupH - blockH) / 2;
            measured.forEach((item) => {
                domL.push({ d: item.domain, y, h: item.f.h, w: item.f.w, lines: item.f.lines });
                y += item.f.h + GAP;
            });
            pipeL.push({ key: pipeline, n: groupDomains.length, yMid: yu + groupH / 2, h: pf.h, w: pf.w, lines: pf.lines });
            yu += groupH;
        });
        const upperH = Math.max(yu, qTot, NHMIN);

        const qOrder = [];
        const qGroups = {};
        products.forEach((product) => {
            const key = (product.query || '').trim() || '\u0000none';
            if (!qGroups[key]) {
                qGroups[key] = [];
                qOrder.push(key);
            }
            qGroups[key].push(product);
        });
        let yo = 0;
        const offL = [];
        const prodL = [];
        const pqL = [];
        qOrder.forEach((qkey, groupIndex) => {
            if (groupIndex > 0) yo += GGAP;
            const label = qkey === '\u0000none' ? '(no product query)' : qkey;
            const qf = fit(label, null, false, lqW, 4);
            const items = qGroups[qkey].map((product) => {
                const offers = product.offers || [];
                const pf = fitStack(product.title, product.price || '', false, lpW, 4);
                const measuredOffers = offers.map((offer) => {
                    const best = Boolean(offer.tag && /best/i.test(offer.tag));
                    return { offer, best, f: fitStack(offer.merchant || '-', offer.total || offer.price || '', best, loW, 3) };
                });
                let blockH = measuredOffers.length ? 0 : pf.h;
                measuredOffers.forEach((item, index) => {
                    blockH += item.f.h;
                    if (index < measuredOffers.length - 1) blockH += GAP;
                });
                return { product, pf, measuredOffers, groupH: Math.max(blockH, pf.h), blockH, offers: offers.length };
            });
            let clusterH = 0;
            items.forEach((item, index) => {
                clusterH += item.groupH;
                if (index < items.length - 1) clusterH += GAP;
            });
            const groupH = Math.max(clusterH, qf.h);
            const start = yo;
            let cy = yo + (groupH - clusterH) / 2;
            items.forEach((item) => {
                const pmid = cy + item.groupH / 2;
                let oy = cy + (item.groupH - item.blockH) / 2;
                item.measuredOffers.forEach((offer) => {
                    offL.push({ o: offer.offer, y: oy, h: offer.f.h, w: offer.f.w, lines: offer.f.lines, pmid, pw: item.pf.w, best: offer.best });
                    oy += offer.f.h + GAP;
                });
                prodL.push({ p: item.product, yMid: pmid, h: item.pf.h, w: item.pf.w, lines: item.pf.lines, offers: item.offers, err: item.product.offerError, qmid: start + groupH / 2, qRight: xLQ + qf.w });
                cy += item.groupH + GAP;
            });
            pqL.push({ label, qf, yMid: start + groupH / 2, n: items.length });
            yo = start + groupH + GAP;
        });
        yo = Math.max(yo - GAP, NHMIN);

        const upTop = TOP;
        const loTop = TOP + upperH + BANDGAP;
        const lowerH = hasProducts ? yo : 0;
        const height = hasProducts ? loTop + lowerH + 22 : upTop + upperH + 28;
        const centerY = hasProducts ? (upTop + loTop + lowerH) / 2 : upTop + upperH / 2;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('font-family', 'ui-monospace,Menlo,Consolas,monospace');
        svg.appendChild(svgNode('rect', { x: 0, y: 0, width, height, fill: '#ffffff' }));

        const edgeGroup = svgNode('g', { fill: 'none' });
        const nodeGroup = svgNode('g', {});
        svg.appendChild(edgeGroup);
        svg.appendChild(nodeGroup);
        const edge = (x1, y1, x2, y2, color, w, op) => {
            const dx = (x2 - x1) * 0.45;
            edgeGroup.appendChild(svgNode('path', { d: `M${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, stroke: color, 'stroke-width': w || 1.1, 'stroke-opacity': op == null ? 0.5 : op }));
        };
        const hdr = (x, y, text) => nodeGroup.appendChild(svgText(x, y, text.toUpperCase(), 10, '#9aa0a6', 700));
        const refreshGlyph = (x, y, product, text) => {
            const color = product.lookupKey ? '#2563eb' : '#98a2b3';
            const group = svgNode('g', { transform: `translate(${x} ${y - 10}) scale(.72)`, cursor: product.lookupKey ? 'pointer' : 'default' });
            group.appendChild(svgNode('title', {}));
            group.lastChild.textContent = product.lookupKey ? `Reload offers for ${product.title || 'product'}` : 'No lookup key available';
            group.appendChild(svgNode('rect', { x: 0, y: 0, width: 24, height: 24, rx: 4, fill: 'transparent' }));
            group.appendChild(svgNode('path', { d: 'M20.5 5.5H9.5C5.78672 5.5 3 8.18503 3 12', fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            group.appendChild(svgNode('path', { d: 'M3.5 18.5H14.5C18.2133 18.5 21 15.815 21 12', fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            group.appendChild(svgNode('path', { d: 'M18.5 3C18.5 3 21 4.84122 21 5.50002C21 6.15882 18.5 8 18.5 8', fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            group.appendChild(svgNode('path', { d: 'M5.49998 16C5.49998 16 3.00001 17.8412 3 18.5C2.99999 19.1588 5.5 21 5.5 21', fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            if (product.lookupKey) {
                group.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    refreshProductOffers(product);
                });
            }
            nodeGroup.appendChild(group);
            nodeGroup.appendChild(svgText(x + 22, y + 4, text, 10, product.offerLoading ? '#2563eb' : '#c2c7cd', 400));
        };
        const node = (x, y, w, hgt, lines, options) => {
            const opts = options || {};
            const group = svgNode('g', {});
            group.appendChild(svgNode('rect', { x, y, width: w, height: hgt, rx: 7, fill: opts.fill || '#fff', stroke: opts.stroke || '#E7E9ED', 'stroke-width': opts.sw || 1 }));
            if (opts.dot) group.appendChild(svgNode('circle', { cx: x + 10, cy: y + hgt / 2, r: 3.3, fill: opts.dot }));
            const tx = svgNode('text', { 'font-size': 11, fill: opts.tc || '#17191f', 'font-weight': opts.bold ? 600 : 400 });
            const x0 = x + PADX + (opts.dot ? 13 : 0);
            lines.forEach((line, index) => tx.appendChild(svgTspan(x0, y + PADY + 10.5 + index * LINE, line)));
            group.appendChild(tx);
            if (opts.right) group.appendChild(svgText(x + w - 8, y + PADY + 10.5, opts.right, 10.5, opts.rc || '#9aa0a6', opts.bold ? 600 : 400, 'end'));
            if (opts.meta) group.appendChild(svgText(x + w - 8, y + hgt - PADY - 2, opts.meta, 10.5, opts.rc || '#69717d', opts.bold ? 600 : 400, 'end'));
            if (opts.title) {
                const title = svgNode('title', {});
                title.textContent = opts.title;
                group.appendChild(title);
            }
            if (opts.href) {
                const anchor = svgNode('a', { href: opts.href, target: '_blank', rel: 'noopener' });
                anchor.appendChild(group);
                nodeGroup.appendChild(anchor);
            } else {
                nodeGroup.appendChild(group);
            }
            return group;
        };

        hdr(xPrompt, upTop - 14, 'prompt');
        hdr(xQuery, upTop - 14, 'fan-out queries');
        hdr(xHub, upTop - 14, 'search / shop');
        hdr(xMid, upTop - 14, 'pipelines');
        hdr(xEnd, upTop - 14, 'sources  (cited = black)');
        if (hasProducts) {
            hdr(xLQ, loTop - 14, 'product fan-out');
            hdr(xLP, loTop - 14, 'products');
            hdr(xLO, loTop - 14, 'offers  (dot = best price)');
        }

        const spineY = centerY;
        const promptFit = fit(intel.prompt || '(prompt)', null, false, promptW, 4);
        node(xPrompt, spineY - promptFit.h / 2, promptFit.w, promptFit.h, promptFit.lines, { fill: '#17191f', tc: '#fff', bold: true, title: intel.prompt });
        const hubFit = fit('web.run', null, false, hubW);
        node(xHub, spineY - hubFit.h / 2, hubFit.w, hubFit.h, hubFit.lines, { fill: '#2b2f36', tc: '#fff', title: 'ChatGPT web/product tool calls' });
        const promptR = xPrompt + promptFit.w;
        const hubR = xHub + hubFit.w;

        let qy = spineY - qTot / 2;
        qMs.forEach((item) => {
            const cy = qy + item.f.h / 2;
            edge(promptR, spineY, xQuery, cy, '#CED4DA', 1, 0.5);
            if (!item.more) edge(xQuery + item.f.w, cy, xHub, spineY, '#CED4DA', 1, 0.36);
            node(xQuery, qy, item.f.w, item.f.h, item.f.lines, item.more ? { fill: '#fff', tc: '#9aa0a6' } : { fill: '#F7F8FA', tc: '#42464d', title: `${item.query.query} · via ${item.query.via}` });
            qy += item.f.h + GAP;
        });

        pipeL.forEach((pipeline) => {
            const pcy = upTop + pipeline.yMid;
            edge(hubR, spineY, xMid, pcy, pipelineColor(pipeline.key), Math.min(1 + pipeline.n * 0.22, 4), 0.5);
            node(xMid, pcy - pipeline.h / 2, pipeline.w, pipeline.h, pipeline.lines, { fill: 'rgba(0,0,0,0.03)', stroke: pipelineColor(pipeline.key), tc: pipelineDark(pipeline.key), bold: true });
        });
        domL.forEach((item) => {
            const dcy = upTop + item.y + item.h / 2;
            const pipeline = pipeL.find((candidate) => candidate.key === item.d.pipeline);
            if (pipeline) edge(xMid + pipeline.w, upTop + pipeline.yMid, xEnd, dcy, pipelineColor(item.d.pipeline), 1, 0.38);
            node(xEnd, upTop + item.y, item.w, item.h, item.lines, { dot: pipelineColor(item.d.pipeline), stroke: item.d.cited ? '#17191f' : '#E7E9ED', sw: item.d.cited ? 1.7 : 1, tc: item.d.cited ? '#17191f' : '#69717d', bold: item.d.cited, right: item.d.cited ? 'cited' : (item.d.n > 1 ? `x${item.d.n}` : ''), rc: item.d.cited ? '#17191f' : '#c2c7cd', title: `${item.d.domain} · ${item.d.pipeline} · ${item.d.n} result${item.d.n > 1 ? 's' : ''}${item.d.cited ? ' · cited' : ''}` });
        });

        if (hasProducts) {
            pqL.forEach((query) => {
                const y = loTop + query.yMid;
                edge(hubR, spineY, xLQ, y, '#B8BEC6', Math.min(1 + query.n * 0.35, 3.4), 0.5);
                node(xLQ, y - query.qf.h / 2, query.qf.w, query.qf.h, query.qf.lines, { fill: '#F5F3FF', stroke: '#D9CFFB', tc: '#6741D9', title: `product query · ${query.n} product${query.n > 1 ? 's' : ''}\n${query.label}` });
            });
            prodL.forEach((product) => {
                const y = loTop + product.yMid;
                edge(product.qRight, loTop + product.qmid, xLP, y, '#CBD2D9', 1.2, 0.5);
                node(xLP, y - product.h / 2, product.w, product.h, product.lines, { fill: '#fff', stroke: '#E7E9ED', tc: '#17191f', meta: product.p.price || '', rc: '#17191f', href: product.p.providerUrl || '', title: `${product.p.title}${product.p.price ? ` · ${product.p.price}` : ''}${product.p.merchants ? ` · ${product.p.merchants}` : ''}` });
                if (!product.offers) refreshGlyph(xLO, y, product.p, product.p.offerLoading ? 'loading offers...' : (product.err ? 'offers unavailable' : '- no offers -'));
            });
            offL.forEach((offer) => {
                const y = loTop + offer.y + offer.h / 2;
                const best = offer.best;
                edge(xLP + offer.pw, loTop + offer.pmid, xLO, y, best ? '#0CA678' : '#CBD2D9', best ? 1.6 : 1, 0.5);
                const offerHref = offer.o.url || marketShoppingUrl(offer.o.shoppingUrl || '');
                node(xLO, loTop + offer.y, offer.w, offer.h, offer.lines, { dot: best ? '#0CA678' : null, stroke: best ? '#0CA678' : '#E7E9ED', sw: best ? 1.6 : 1, tc: best ? '#0CA678' : '#42464d', bold: best, meta: offer.o.total || offer.o.price || '', rc: best ? '#0CA678' : '#69717d', href: offerHref, title: `${offer.o.merchant || ''} · ${offer.o.total || offer.o.price || ''}${offer.o.details ? ` · ${offer.o.details}` : ''}${offerHref ? ` · ${offer.o.url ? offerHref : `Google Shopping fallback: ${offerHref}`}` : ''}` });
            });
        }

        if (!sources.length && !queries.length && !products.length) {
            node(30, 70, 260, 36, ['nothing captured for this conversation'], { fill: '#fff', tc: '#9aa0a6' });
        }
        return svg;
    }

    function svgNode(tag, attrs) {
        const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
        return node;
    }

    function svgText(x, y, text, size, fill, weight, anchor) {
        const attrs = { x, y, 'font-size': size, fill, 'font-weight': weight || 400 };
        if (anchor) attrs['text-anchor'] = anchor;
        const node = svgNode('text', attrs);
        node.textContent = text;
        return node;
    }

    function svgTspan(x, y, text) {
        const node = svgNode('tspan', { x, y });
        node.textContent = text;
        return node;
    }

    function orderedPipelineKeys() {
        const counts = {};
        (state.intel.sources || []).forEach((source) => {
            const pipeline = formatPipeline(source.pipeline);
            counts[pipeline] = (counts[pipeline] || 0) + 1;
        });
        const preferred = ['serp', 'labrador', 'bright', 'oxylabs', 'bing'];
        return preferred.filter((key) => counts[key]).concat(Object.keys(counts).filter((key) => !preferred.includes(key)));
    }

    const STAGE_META = {
        problem: { label: 'Problem-aware', color: '#2563eb' },
        solution: { label: 'Solution-aware', color: '#7c3aed' },
        decision: { label: 'Decision-aware', color: '#16a34a' },
        retention: { label: 'Retention', color: '#d97706' },
        unaware: { label: 'Unaware', color: '#71717a' },
    };
    const STAGE_ORDER = ['problem', 'solution', 'decision', 'retention', 'unaware'];
    const QTYPE_META = {
        comparison: 'Comparison', 'how-to': 'How-to', bofu: 'BoFu', branded: 'Branded', operator: 'Operator', other: 'Other',
    };
    const CATEGORY_META = {
        firstparty: { label: 'commercial / vendor-like', color: '#0f766e' },
        commercial: { label: 'commercial / vendor-like', color: '#0f766e' },
        retailer: { label: 'retailer / marketplace', color: '#0d9488' },
        brand: { label: 'brand / vendor', color: '#0891b2' },
        price: { label: 'price / comparison', color: '#ca8a04' },
        review: { label: 'review / test site', color: '#d97706' },
        reddit: { label: 'reddit', color: '#e5533d' },
        news: { label: 'news / media', color: '#2563eb' },
        blog: { label: 'blog', color: '#8b5cf6' },
        forum: { label: 'forum / Q&A', color: '#6d28d9' },
        social: { label: 'social / video', color: '#db2777' },
        wiki: { label: 'encyclopedia', color: '#71717a' },
        docs: { label: 'docs / repo', color: '#0284c7' },
        'gov-edu': { label: 'gov / edu', color: '#4d7c0f' },
        other: { label: 'other', color: '#a1a1aa' },
    };

    function pipelineColor(pipeline) {
        return { serp: '#8A8F98', labrador: '#4C6EF5', bright: '#12B886', oxylabs: '#F59F00', bing: '#0B7285', Unknown: '#868e96' }[pipeline] || '#CBD2D9';
    }

    function pipelineDark(pipeline) {
        return { serp: '#495057', labrador: '#3b5bdb', bright: '#099268', oxylabs: '#E8590C', bing: '#095665', Unknown: '#495057' }[pipeline] || '#495057';
    }

    function tagStyle(tag) {
        const bg = /^#[0-9a-f]{6}$/i.test(tag && tag.color || '') ? tag.color : '#2563eb';
        const rgb = bg.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255);
        const linear = rgb.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
        const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        return { background: bg, color: luminance > 0.58 ? '#111827' : '#ffffff', border: `1px solid ${bg}` };
    }

    function isBestOffer(offer) {
        return Boolean(offer && offer.tag && /best/i.test(offer.tag));
    }

    function compactCount(value) {
        if (value == null || value === '') return '';
        const numeric = Number(String(value).replace(/[^\d.]/g, ''));
        if (!Number.isFinite(numeric)) return String(value);
        if (numeric >= 1000) return `${(numeric / 1000).toFixed(1).replace('.0', '')}k`;
        return String(Math.round(numeric));
    }

    function productRatingText(product) {
        const rating = product && product.rating != null && product.rating !== '' ? String(product.rating) : '';
        const reviews = compactCount(product && product.reviews);
        if (!rating && !reviews) return '';
        if (rating && reviews) return `${rating} · ${reviews} reviews`;
        if (rating) return rating;
        return `${reviews} reviews`;
    }

    function canLoadInsight(product) {
        return Boolean(product && product.lookupKey && product.messageId);
    }

    function insightSentimentTotal(insight) {
        const counts = (insight && insight.sentimentCounts) || {};
        return (counts.positive || 0) + (counts.neutral || 0) + (counts.negative || 0);
    }

    function starIcon() {
        const icon = svgNode('svg', { class: 'ratingstar', viewBox: '0 0 24 24', width: '14', height: '14', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z', fill: '#efc823', stroke: '#efc823', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        return icon;
    }

    function googleShoppingIcon() {
        const icon = svgNode('svg', { class: 'gshopicon', viewBox: '0 0 271.12 305.88', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { fill: '#4285f4', d: 'M184.22,57.35c-4.07,0-7.71-2.89-8.52-7.04-3.82-19.7-19.94-32.94-40.11-32.94s-36.34,13.24-40.16,32.94c-.91,4.71-5.48,7.8-10.18,6.88-4.71-.91-7.79-5.47-6.88-10.18C83.73,19.33,107.25,0,135.54,0s51.85,19.33,57.22,47.01c.92,4.71-2.17,9.27-6.88,10.18-.56.11-1.12.16-1.67.16Z' }));
        icon.appendChild(svgNode('path', { fill: '#fabb05', d: 'M270.23,115.09l.65-5.09c1.09-8.48-1.52-17.02-7.15-23.43-5.64-6.42-13.74-10.1-22.27-10.1H56.22c-.46,21.03,7.31,42.22,23.32,58.28,31.09,31.17,81.46,31.21,112.52.07,21.39-20.85,50.09-28.62,78.17-19.72Z' }));
        icon.appendChild(svgNode('path', { fill: '#4285f4', d: 'M29.65,76.47c-8.52,0-16.63,3.68-22.26,10.1C1.76,92.98-.84,101.52.24,110l20.6,160.82c21.2.68,42.6-7.02,58.77-23.23,31.05-31.13,31.02-81.66-.07-112.84-16.01-16.06-23.78-37.25-23.32-58.28h-26.57Z' }));
        icon.appendChild(svgNode('path', { fill: '#34a853', d: 'M270.25,114.94c-26.23-8.14-55.43-2.95-78.19,19.87-31.05,31.14-31.02,81.66.07,112.84,16,16.04,23.77,37.22,23.31,58.23h4.26c14.92,0,27.51-11.11,29.41-25.95l21.13-164.99Z' }));
        icon.appendChild(svgNode('path', { fill: '#e94235', d: 'M79.61,247.58c-16.17,16.21-37.57,23.91-58.77,23.23l1.17,9.11c1.9,14.84,14.5,25.95,29.41,25.95h164.01c.45-21.01-7.3-42.18-23.31-58.23-31.1-31.18-81.47-31.21-112.52-.07Z' }));
        return icon;
    }

    function arrowRightIcon() {
        const icon = svgNode('svg', { class: 'routearrow', viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M12.5 8.45596V9L6.5 9C5.56812 9 5.10218 9 4.73463 9.15224C4.24458 9.35523 3.85523 9.74458 3.65224 10.2346C3.5 10.6022 3.5 11.0681 3.5 12C3.5 12.9319 3.5 13.3978 3.65224 13.7654C3.85523 14.2554 4.24458 14.6448 4.73463 14.8478C5.10218 15 5.56812 15 6.5 15H12.5V15.544C12.5 17.6268 12.5 18.6681 13.1003 18.9422C13.7006 19.2163 14.4183 18.5026 15.8536 17.0751L19.4172 13.5311C20.1391 12.8132 20.5 12.4542 20.5 12C20.5 11.5458 20.1391 11.1868 19.4172 10.4689L15.8536 6.92487C14.4183 5.49743 13.7006 4.78372 13.1003 5.05779C12.5 5.33185 12.5 6.37322 12.5 8.45596Z' }));
        return icon;
    }

    function refreshIcon() {
        const icon = svgNode('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4' }));
        icon.appendChild(svgNode('path', { d: 'M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4' }));
        return icon;
    }

    function chevronIcon() {
        const icon = svgNode('svg', { class: 'chev', viewBox: '0 0 24 24', width: '13', height: '13', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M6 9l6 6 6-6', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        return icon;
    }

    function closeIcon() {
        const icon = svgNode('svg', { viewBox: '0 0 24 24', width: '18', height: '18', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        icon.appendChild(svgNode('path', { d: 'M18 6L6.00081 17.9992M17.9992 18L6 6.00085' }));
        return icon;
    }

    function primaryMerchantLabel(value) {
        return String(value || '').replace(/\s*\+\s*others\b/i, '').trim();
    }

    function compactUrlLabel(url) {
        if (!url) return '';
        const domain = CORE().cleanDomain(url);
        return domain || String(url).replace(/^https?:\/\//, '').split(/[/?#]/)[0];
    }

    // Google Shopping links open with the requested market applied (gl/hl);
    // non-Google URLs and metadata-provided locales pass through untouched.
    function marketShoppingUrl(url) {
        if (!url) return '';
        try {
            return CORE().applyMarketToGoogleShoppingUrl(url, normalizeProductMarket(state.productMarket)) || url;
        } catch (_) {
            return url;
        }
    }

    function isChatGptUrl(url) {
        const domain = compactUrlLabel(url).toLowerCase();
        return domain === 'chatgpt.com' || domain.endsWith('.chatgpt.com');
    }

    function usableProductUrl(url) {
        return url && !isChatGptUrl(url) ? url : '';
    }

    function formatDate(value) {
        if (value == null || value === '') return '';
        const text = String(value).trim();
        if (/^\d{4}$/.test(text)) return text;
        let date;
        if (/^\d{9,13}(?:\.\d+)?$/.test(text)) {
            let numeric = Number(text);
            if (numeric < 1e12) numeric *= 1000;
            date = new Date(numeric);
        } else {
            date = new Date(text);
        }
        if (Number.isNaN(date.getTime())) return text;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    }

    function renderSources() {
        return table(['domain', 'pipeline', 'type', 'title', 'url', 'date'], state.intel.sources.map((source) => [
            source.domain,
            formatPipeline(source.pipeline),
            source.category ? h('span', { style: { color: (CATEGORY_META[source.category] || {}).color || 'inherit' }, text: (CATEGORY_META[source.category] || {}).label || source.category }) : '',
            source.title,
            link(source.url),
            h('span', { class: 'datecell', text: formatDate(source.pubDate) }),
        ]));
    }

    function renderCitations() {
        return table(['domain', 'title', 'url', 'type'], state.intel.citations.map((citation) => [
            citation.domain,
            citation.title,
            link(citation.url),
            citation.refType || '',
        ]));
    }

    function renderResearch() {
        const research = state.intel.deepResearch || { steps: [], quotes: [], stats: {}, selectedSources: [], asyncSources: {} };
        if (!research.steps.length) {
            const census = research.census || { authors: {}, contentTypes: {}, commands: {}, recipients: {}, hintKeys: {} };
            const list = (bucket) => {
                const keys = Object.keys(bucket).sort((left, right) => bucket[right] - bucket[left]);
                if (!keys.length) return h('div', { class: 'rmeta' }, '—');
                return h('div', { class: 'rmeta' }, keys.slice(0, 18).map((key) => `${key} ×${bucket[key]}`).join('  ·  '));
            };
            const selected = research.selectedSources || [];
            const backends = Object.keys(research.asyncSources || {});
            const blocks = [];
            blocks.push(h('div', { class: 'rnote' },
                'Deep Research browses server-side and streams the live step trail (search → open → find) over a WebSocket that ChatGPT does not persist into the conversation. The per-step timeline therefore can’t be rebuilt after the fact — only the artifacts the run saved are recoverable, shown below.'
                + (research.version ? `  Deep Research version: ${research.version}.` : '')));
            if (backends.length) {
                const total = backends.reduce((sum, key) => sum + (research.asyncSources[key] || 0), 0);
                blocks.push(h('div', { class: 'rchips' },
                    h('span', { class: 'rchip' }, h('b', { text: String(total) }), ' async retrieval turns'),
                    backends.map((key) => h('span', { class: 'rchip' }, h('b', { text: String(research.asyncSources[key]) }), ` ${key}`))));
            }
            if (selected.length) {
                blocks.push(h('div', { class: 'eyebrow', style: { margin: '14px 0 8px' } }, `Sources the run selected (${selected.length})`));
                selected.forEach((item) => blocks.push(h('div', { class: 'rstep', 'data-filter-row': '1' },
                    h('span', { class: 'rbadge rbadge-quote' }, 'source'),
                    h('div', { class: 'rstepbody' },
                        item.url ? h('a', { class: 'rmain', href: item.url, target: '_blank', rel: 'noopener noreferrer', title: item.url, text: item.title || item.domain || item.url })
                                 : h('div', { class: 'rmain', text: item.title || item.domain || '(source)' }),
                        h('div', { class: 'rmeta', text: item.domain + (item.attribution ? ` · ${item.attribution}` : '') })))));
            } else {
                const nothingPersisted = state.intel.stats && !state.intel.stats.citations && !state.intel.stats.sources;
                blocks.push(h('div', { class: 'small', style: { margin: '10px 0' } }, nothingPersisted
                    ? 'Verdict: this run persisted no source or citation data into the conversation JSON at all — every citation-bearing field is an empty placeholder (see :empty markers below). The report’s citations exist only server-side / in the live stream and cannot be recovered post-hoc from this conversation.'
                    : 'No caterpillar_selected_sources were persisted here — the Sources and Citations tabs hold the sources that made it into the final report.'));
            }
            blocks.push(h('details', { class: 'rcensus' },
                h('summary', { class: 'small' }, 'Conversation shape (diagnostic)'),
                h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'authors'), h('div', { class: 'rstepbody' }, list(census.authors))),
                h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'types'), h('div', { class: 'rstepbody' }, list(census.contentTypes))),
                h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'commands'), h('div', { class: 'rstepbody' }, list(census.commands))),
                h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'recipients'), h('div', { class: 'rstepbody' }, list(census.recipients))),
                h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'meta keys'), h('div', { class: 'rstepbody' }, list(census.hintKeys))),
                census.allMetaKeys && Object.keys(census.allMetaKeys).length ? h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'all keys'), h('div', { class: 'rstepbody' }, h('div', { class: 'rmeta', style: { whiteSpace: 'normal' }, text: Object.keys(census.allMetaKeys).sort((l, r) => census.allMetaKeys[r] - census.allMetaKeys[l]).map((key) => `${key} ×${census.allMetaKeys[key]}`).join('  ·  ') }))) : null,
                Object.keys(census.samples || {}).map((key) => h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, key.replace(/^_/, '').slice(0, 14)), h('div', { class: 'rstepbody' }, h('div', { class: 'rmeta', style: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, text: census.samples[key] })))),
                census.sampleCaterpillar ? h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'cat. shape'), h('div', { class: 'rstepbody' }, h('div', { class: 'rmeta', text: census.sampleCaterpillar }))) : null,
                census.sampleWebRun ? h('div', { class: 'rstep' }, h('span', { class: 'rbadge rbadge-other' }, 'web.run shape'), h('div', { class: 'rstepbody' }, h('div', { class: 'rmeta', text: census.sampleWebRun }))) : null));
            return h('div', null, blocks);
        }
        const stats = research.stats || {};
        const chip = (value, label) => h('span', { class: 'rchip' }, h('b', { text: String(value ?? 0) }), ` ${label}`);
        const badge = (step) => {
            const known = ['search', 'open', 'find', 'click', 'quote', 'blocked'];
            const kind = step.robotsBlocked ? 'blocked' : (known.includes(step.command) ? step.command : 'other');
            return h('span', { class: `rbadge rbadge-${kind}` }, step.robotsBlocked ? 'blocked' : (step.command || 'step'));
        };
        const stepRow = (step) => {
            const meta = [];
            if (step.command === 'search') {
                if (step.topn != null) meta.push(`topn ${step.topn}`);
                if (step.source) meta.push(step.source);
                if (step.caterpillarUrls.length) meta.push(`${step.caterpillarUrls.length} SERP candidates`);
            }
            if (step.command === 'open') {
                if (step.window) meta.push(`lines ${step.window.from}–${step.window.to} of ${step.window.total}`);
                if (step.readIndex > 1) meta.push(`re-read #${step.readIndex}`);
                if (step.fromUrl) meta.push(`followed link from “${step.fromTitle || CORE().cleanDomain(step.fromUrl)}”`);
            }
            if (step.command === 'find') meta.push(step.findMiss ? 'no match → likely re-query or abandon' : 'match → triggers positioned re-read');
            if (step.robotsBlocked) meta.push('Fetch denied by robots.txt (OAI-SearchBot) — page invisible to Deep Research');
            const main = step.command === 'search' ? (step.query || step.summaryPreview || '(query)')
                : step.command === 'find' ? `“${step.pattern || step.query || ''}”`
                : (step.url || step.title || step.query || step.summaryPreview || step.resultPreview || '(page)');
            const looksEmpty = !step.url && !step.query && !step.pattern && !step.window;
            if (looksEmpty && step.debug) meta.push(`shape: author=${step.debug.author} · type=${step.debug.contentType} · command=${step.debug.rawCommand} · meta[${step.debug.metaKeys || '—'}] · kwargs[${step.debug.kwargsKeys || '—'}]`);
            return h('div', { class: 'rstep' + (step.robotsBlocked ? ' rstep-blocked' : ''), 'data-filter-row': '1' },
                badge(step),
                h('div', { class: 'rstepbody' },
                    step.command === 'open' && step.url
                        ? h('a', { class: 'rmain', href: step.url, target: '_blank', rel: 'noopener noreferrer', title: step.url, text: main })
                        : h('div', { class: 'rmain', text: main }),
                    meta.length ? h('div', { class: 'rmeta', text: meta.join('  ·  ') }) : null));
        };
        return h('div', null,
            h('div', { class: 'rchips' },
                chip(stats.searches, 'searches'), chip(stats.opens, 'opens'), chip(stats.uniquePagesRead, 'pages read'),
                chip(stats.reReads, 're-read'), chip(stats.finds, 'finds'), chip(stats.findMisses, 'find misses'),
                chip(stats.linkFollows, 'link follows'), chip(stats.robotsBlocked, 'robots-blocked')),
            h('div', { class: 'rnote' }, 'Deep Research reads via Bing (source: web_with_bing) with three commands — search → open → find — in ~5–6k-char windows. Re-reads and link follows signal a page earned attention; being read ≠ being cited.'),
            h('div', { class: 'rsteps' }, research.steps.map(stepRow)),
            research.quotes.length ? h('div', null,
                h('div', { class: 'eyebrow', style: { margin: '18px 0 8px' } }, 'Captured quotes'),
                research.quotes.map((quote) => h('div', { class: 'rquote', 'data-filter-row': '1' },
                    h('div', { class: 'rmeta' }, quote.domain + (quote.title ? ` · ${quote.title}` : '')),
                    h('div', { text: quote.text })))) : null);
    }

    function renderBrowse() {
        return table(['action', 'argument'], state.intel.browseActions.map((action) => [
            action.action,
            action.arg,
        ]));
    }

    // Simplified inline SVG flags (viewBox 0 0 30 20). Static trusted markup only.
    const FLAG_SVGS = {
        us: '<rect width="30" height="20" fill="#B22234"/><g fill="#fff"><rect y="1.54" width="30" height="1.54"/><rect y="4.62" width="30" height="1.54"/><rect y="7.69" width="30" height="1.54"/><rect y="10.77" width="30" height="1.54"/><rect y="13.85" width="30" height="1.54"/><rect y="16.92" width="30" height="1.54"/></g><rect width="12" height="10.77" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.2" cy="2.2" r=".62"/><circle cx="5" cy="2.2" r=".62"/><circle cx="7.8" cy="2.2" r=".62"/><circle cx="10.6" cy="2.2" r=".62"/><circle cx="3.6" cy="4.6" r=".62"/><circle cx="6.4" cy="4.6" r=".62"/><circle cx="9.2" cy="4.6" r=".62"/><circle cx="2.2" cy="7" r=".62"/><circle cx="5" cy="7" r=".62"/><circle cx="7.8" cy="7" r=".62"/><circle cx="10.6" cy="7" r=".62"/><circle cx="3.6" cy="9.2" r=".62"/><circle cx="6.4" cy="9.2" r=".62"/><circle cx="9.2" cy="9.2" r=".62"/></g>',
        de: '<rect width="30" height="20"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/>',
        gb: '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.6"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.5"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="3.9"/>',
        ca: '<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#D80621"/><rect x="22.5" width="7.5" height="20" fill="#D80621"/><path fill="#D80621" d="M15 4.2l.9 1.9 1.7-.8-.5 2 2.1-.3-1.1 1.7 1.8.8-1.8.8 1.1 1.7-2.1-.3.3 1.9-1.9-.5-.2 2.7h-.6l-.2-2.7-1.9.5.3-1.9-2.1.3 1.1-1.7-1.8-.8 1.8-.8-1.1-1.7 2.1.3-.5-2 1.7.8z"/>',
        au: '<rect width="30" height="20" fill="#012169"/><g transform="scale(.5)"><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.6"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.5"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="3.9"/></g><g fill="#fff"><circle cx="7.5" cy="15" r="1.15"/><circle cx="23" cy="3.6" r=".85"/><circle cx="27" cy="7.6" r=".85"/><circle cx="23" cy="16.2" r=".85"/><circle cx="19.6" cy="10.2" r=".85"/><circle cx="25.4" cy="11.4" r=".55"/></g>',
        fr: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#002654"/><rect x="20" width="10" height="20" fill="#CE1126"/>',
        es: '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/><circle cx="9" cy="10" r="1.4" fill="#AA151B"/>',
        it: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#008C45"/><rect x="20" width="10" height="20" fill="#CD212A"/>',
        nl: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#AE1C28"/><rect y="13.33" width="30" height="6.67" fill="#21468B"/>',
        be: '<rect width="30" height="20" fill="#FFCD00"/><rect width="10" height="20"/><rect x="20" width="10" height="20" fill="#C8102E"/>',
        ch: '<rect width="30" height="20" fill="#DA291C"/><rect x="12.8" y="6" width="4.4" height="8" fill="#fff"/><rect x="11" y="7.8" width="8" height="4.4" fill="#fff"/>',
        at: '<rect width="30" height="20" fill="#EF3340"/><rect y="6.67" width="30" height="6.67" fill="#fff"/>',
        se: '<rect width="30" height="20" fill="#006AA7"/><rect x="9" width="3.6" height="20" fill="#FECC02"/><rect y="8.2" width="30" height="3.6" fill="#FECC02"/>',
        dk: '<rect width="30" height="20" fill="#C8102E"/><rect x="9" width="3.6" height="20" fill="#fff"/><rect y="8.2" width="30" height="3.6" fill="#fff"/>',
        no: '<rect width="30" height="20" fill="#BA0C2F"/><rect x="8" width="5" height="20" fill="#fff"/><rect y="7.5" width="30" height="5" fill="#fff"/><rect x="9.25" width="2.5" height="20" fill="#00205B"/><rect y="8.75" width="30" height="2.5" fill="#00205B"/>',
        fi: '<rect width="30" height="20" fill="#fff"/><rect x="8.6" width="4.8" height="20" fill="#002F6C"/><rect y="7.6" width="30" height="4.8" fill="#002F6C"/>',
        ie: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#009A44"/><rect x="20" width="10" height="20" fill="#FF8200"/>',
        pl: '<rect width="30" height="20" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/>',
        pt: '<rect width="30" height="20" fill="#DA291C"/><rect width="12" height="20" fill="#046A38"/><circle cx="12" cy="10" r="3.6" fill="#FFE900"/><circle cx="12" cy="10" r="1.9" fill="#DA291C"/><circle cx="12" cy="10" r="1.1" fill="#fff"/>',
        br: '<rect width="30" height="20" fill="#009739"/><path d="M15 2.7 27.3 10 15 17.3 2.7 10Z" fill="#FEDD00"/><circle cx="15" cy="10" r="3.7" fill="#012169"/><path d="M11.6 9.2c2.3-.7 4.9 0 6.7 1.5" stroke="#fff" stroke-width=".7" fill="none"/>',
        mx: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#006341"/><rect x="20" width="10" height="20" fill="#C8102E"/><circle cx="15" cy="10" r="1.9" fill="#8F4620"/>',
        ar: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#6CACE4"/><rect y="13.33" width="30" height="6.67" fill="#6CACE4"/><circle cx="15" cy="10" r="2" fill="#FFB81C"/><circle cx="15" cy="10" r="2" fill="none" stroke="#8a5d1a" stroke-width=".3"/>',
        cl: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#DA291C"/><rect width="10" height="10" fill="#0032A0"/><path fill="#fff" d="M5 2.4l.78 2.4h2.52L6.26 6.28l.78 2.4L5 7.2 2.96 8.68l.78-2.4L1.7 4.8h2.52z"/>',
        co: '<rect width="30" height="20" fill="#C8102E"/><rect width="30" height="15" fill="#003087"/><rect width="30" height="10" fill="#FFCD00"/>',
        jp: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
        kr: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.5" fill="#0047A0"/><path d="M9.5 10a5.5 5.5 0 0 1 11 0 2.75 2.75 0 0 0-5.5 0 2.75 2.75 0 0 1-5.5 0Z" fill="#CD2E3A"/>',
        in: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#FF9933"/><rect y="13.33" width="30" height="6.67" fill="#046A38"/><circle cx="15" cy="10" r="2.2" fill="none" stroke="#06038D" stroke-width=".7"/><circle cx="15" cy="10" r=".5" fill="#06038D"/>',
    };
    const FLAG_FALLBACK = '<rect width="30" height="20" fill="#E4E4E7"/><circle cx="15" cy="10" r="5.2" fill="none" stroke="#A1A1AA" stroke-width="1.1"/><path d="M15 4.8v10.4M9.8 10h10.4M15 4.8c-2.4 2.6-2.4 7.8 0 10.4M15 4.8c2.4 2.6 2.4 7.8 0 10.4" fill="none" stroke="#A1A1AA" stroke-width=".9"/>';

    function countryFlagNode(code) {
        const inner = FLAG_SVGS[String(code || '').toLowerCase()] || FLAG_FALLBACK;
        const span = h('span', { class: 'mflag', 'aria-hidden': 'true' });
        span.innerHTML = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" focusable="false">${inner}</svg>`;
        return span;
    }

    function chevronIcon() {
        const icon = svgNode('svg', { class: 'mchevron', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M6 9L12 15L18 9' }));
        return icon;
    }

    function checkIcon() {
        const icon = svgNode('svg', { class: 'mcheck', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('path', { d: 'M5 13L9 17L19 7' }));
        return icon;
    }

    function infoIcon() {
        const icon = svgNode('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        icon.appendChild(svgNode('circle', { cx: '12', cy: '12', r: '10' }));
        icon.appendChild(svgNode('path', { d: 'M12 16V12' }));
        icon.appendChild(svgNode('path', { d: 'M12.125 8.25H12M12.25 8.25C12.25 8.11193 12.1381 8 12 8C11.8619 8 11.75 8.11193 11.75 8.25C11.75 8.38807 11.8619 8.5 12 8.5C12.1381 8.5 12.25 8.38807 12.25 8.25Z' }));
        return icon;
    }

    // Accessible combobox: trigger button + popover with type-to-filter search,
    // arrow-key navigation, Enter to select, Escape / outside click to dismiss.
    function renderMarketSelect(config) {
        const { value, options, ariaLabel, searchPlaceholder, iconFor, onSelect } = config;
        const showCode = config.showCode !== false;
        const selected = options.find(([code]) => code === value) || options[0];
        let filtered = options.slice();
        let activeIndex = Math.max(0, filtered.findIndex(([code]) => code === value));
        let isOpen = false;

        const root = h('div', { class: 'mselect' });
        const list = h('div', { class: 'mpoplist', role: 'listbox', 'aria-label': ariaLabel });
        const search = options.length > 7
            ? h('input', { class: 'mpopsearch', type: 'text', placeholder: searchPlaceholder, 'aria-label': searchPlaceholder, autocomplete: 'off', spellcheck: 'false' })
            : null;
        const pop = h('div', { class: 'mpop' }, search, list);
        const trigger = h('button', { class: 'mtrigger', type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': `${ariaLabel}: ${selected[1]}`, title: `${ariaLabel}: ${selected[1]}` },
            iconFor(selected[0]),
            h('span', { class: 'mtriglabel', text: selected[1] }),
            showCode ? h('span', { class: 'mtrigcode', text: selected[0].toUpperCase() }) : null,
            chevronIcon());
        root.appendChild(trigger);
        root.appendChild(pop);

        function buildList() {
            list.textContent = '';
            if (!filtered.length) {
                list.appendChild(h('div', { class: 'mempty', text: 'No matches' }));
                return;
            }
            filtered.forEach(([code, label], index) => {
                const isSelected = code === value;
                const option = h('button', {
                    class: `mopt${showCode ? '' : ' nocode'}${isSelected ? ' selected' : ''}${index === activeIndex ? ' active' : ''}`,
                    type: 'button',
                    role: 'option',
                    'aria-selected': isSelected ? 'true' : 'false',
                    onClick: () => choose(code),
                    onMousemove: () => setActive(index),
                },
                iconFor(code),
                h('span', { class: 'moptlabel', text: label }),
                showCode ? h('span', { class: 'moptcode', text: code.toUpperCase() }) : null,
                isSelected ? checkIcon() : h('span'));
                list.appendChild(option);
            });
        }

        function setActive(index) {
            if (index === activeIndex) return;
            activeIndex = index;
            Array.from(list.children).forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex === activeIndex));
        }

        function scrollActiveIntoView() {
            const node = list.children[activeIndex];
            if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
        }

        function applyFilter(query) {
            const text = String(query || '').trim().toLowerCase();
            filtered = text
                ? options.filter(([code, label]) => label.toLowerCase().includes(text) || code.includes(text))
                : options.slice();
            activeIndex = Math.max(0, filtered.findIndex(([code]) => code === value));
            if (text) activeIndex = 0;
            buildList();
            scrollActiveIntoView();
        }

        function onDocPointerDown(event) {
            if (!event.composedPath().includes(root)) close();
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                event.stopPropagation();
                close();
                trigger.focus();
                return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (!filtered.length) return;
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                setActive((activeIndex + delta + filtered.length) % filtered.length);
                scrollActiveIntoView();
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                if (filtered[activeIndex]) choose(filtered[activeIndex][0]);
            }
        }

        function openPop() {
            if (isOpen) return;
            isOpen = true;
            root.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            applyFilter('');
            if (search) {
                search.value = '';
                setTimeout(() => search.focus(), 0);
            }
            document.addEventListener('pointerdown', onDocPointerDown, true);
            root.addEventListener('keydown', onKeyDown);
        }

        function close() {
            if (!isOpen) return;
            isOpen = false;
            root.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            document.removeEventListener('pointerdown', onDocPointerDown, true);
            root.removeEventListener('keydown', onKeyDown);
        }

        function choose(code) {
            close();
            if (code !== value) onSelect(code);
        }

        trigger.addEventListener('click', () => (isOpen ? close() : openPop()));
        if (search) search.addEventListener('input', () => applyFilter(search.value));
        return root;
    }

    function renderProductMarketControls() {
        const market = normalizeProductMarket(state.productMarket);
        return h('div', { class: 'marketgroup', role: 'group', 'aria-label': 'Requested market' },
            h('span', { class: 'mgl', text: 'Market' }),
            renderMarketSelect({
                value: market.gl,
                options: PRODUCT_MARKET_COUNTRIES,
                ariaLabel: 'Country',
                searchPlaceholder: 'Search country\u2026',
                iconFor: countryFlagNode,
                onSelect: (code) => setProductMarket({ gl: code }),
            }),
            renderMarketSelect({
                value: market.hl,
                options: PRODUCT_MARKET_LANGUAGES,
                ariaLabel: 'Language',
                searchPlaceholder: 'Search language\u2026',
                showCode: false,
                iconFor: (code) => h('span', { class: 'mlang', 'aria-hidden': 'true', text: code.toUpperCase() }),
                onSelect: (code) => setProductMarket({ hl: code }),
            }),
            h('span', { class: 'marketinfo', tabindex: '0', role: 'img', 'aria-label': 'Market notice', title: `Requested market ${productMarketLabel(market)} applies to new insight/offer requests and Google Shopping links. ChatGPT may still use account, session, or VPN context internally, so the backend may not fully honor it.` }, infoIcon()));
    }

    function renderProducts() {
        if (!state.intel.products.length) return h('div', { class: 'empty' }, 'No product carousel was captured in this conversation.');
        const canHydrate = state.intel.products.some((product) => product.lookupKey);
        const canInsight = state.intel.products.some(canLoadInsight);
        const hintParts = [
            canInsight && !state.intel.products.some((product) => product.sidebarInsight) ? 'Insights and review sources load on demand.' : '',
            canHydrate && !state.intel.products.some((product) => product.offers && product.offers.length) ? 'Offers load separately when available for the account/product.' : '',
        ].filter(Boolean);
        const ordered = state.intel.products
            .map((product, index) => ({ product, index }))
            .sort((a, b) => ((a.product.position ?? a.index) - (b.product.position ?? b.index)));
        return h('div', null,
            h('div', { class: 'panelh' },
                h('div', { class: 'panelhleft' },
                    h('span', { class: 'eyebrow' }, `${state.intel.products.length} products`),
                    renderProductMarketControls()),
                h('div', { class: 'flowtools' },
                    canInsight ? h('button', { class: 'btn', disabled: state.loadingInsights ? 'disabled' : null, onClick: () => hydrateInsights({ force: true }) }, state.loadingInsights ? 'Loading insights...' : (state.intel.products.some((product) => product.sidebarInsight) ? 'Reload insights' : 'Load insights')) : null,
                    canHydrate ? h('button', { class: 'btn', disabled: state.loadingOffers ? 'disabled' : null, onClick: () => hydrateOffers({ force: true }) }, state.loadingOffers ? 'Loading offers...' : (state.intel.products.some((product) => product.offers && product.offers.length) ? 'Reload offers' : 'Load offers')) : null,
                    h('button', { class: 'btn', onClick: exportProductsCsv }, 'Products CSV'))),
            hintParts.length ? h('div', { class: 'producthint', text: hintParts.join(' ') }) : null,
            state.loadingInsights ? h('div', { class: 'loadingline' }, h('span', { class: 'dotspin' }), state.insightProgress || 'loading product insights...') : null,
            state.loadingOffers ? h('div', { class: 'loadingline' }, h('span', { class: 'dotspin' }), state.offerProgress || 'loading live offers...') : null,
            h('div', { class: 'pgrid' }, ordered.map((item) => renderProductCard(item.product))));
    }

    function renderProductInsight(product) {
        const insight = product.sidebarInsight;
        const sources = reviewSourcesForInsight(insight).slice(0, 5);
        const chipSeen = new Set();
        const chipSources = sources.filter((source) => {
            const key = String(source.displayName || reviewSourceName(source.domain || source.title)).toLowerCase();
            if (chipSeen.has(key)) return false;
            chipSeen.add(key);
            return true;
        });
        const counts = sourcedSentimentCounts(insight);
        const total = sentimentTotal(counts);
        const insightKey = productInsightKey(product);
        const SENTIMENT_KEYS = ['positive', 'neutral', 'negative'];
        const sentimentBar = total ? h('div', { class: 'sentwrap' },
            h('div', { class: 'sentbar', role: 'img', 'aria-label': SENTIMENT_KEYS.map((key) => `${counts[key] || 0} ${key}`).join(', ') },
                SENTIMENT_KEYS.map((key) => counts[key]
                    ? h('i', { class: `sent-${key}`, style: { flexGrow: String(counts[key]) }, title: `${counts[key]} ${key}` })
                    : null)),
            h('div', { class: 'sentlegend' },
                SENTIMENT_KEYS.map((key) => counts[key]
                    ? h('span', { class: 'sentitem' }, h('i', { class: `sentdot sent-${key}` }), h('b', { text: String(counts[key]) }), ` ${key}`)
                    : null),
                h('span', { class: 'senttotal', text: `${total} source${total === 1 ? '' : 's'}` }))) : null;
        const details = h('details', {
            class: 'insightcard',
            open: state.openInsights[insightKey] ? 'open' : null,
            onToggle: (event) => { state.openInsights[insightKey] = event.currentTarget.open; },
        },
        h('summary', null,
            h('div', { class: 'insighttop' },
                h('span', { class: 'insightlabel', text: 'Research insight' }),
                h('span', { class: 'insightaction', 'aria-hidden': 'true' })),
            h('div', { class: 'insightchips' },
                chipSources.length ? chipSources.map(renderInsightSourceChip) : h('span', { class: 'insightchip muted', text: 'No review source captured' }))),
        h('div', { class: 'insightbody' },
            insight.rationale ? h('div', null, h('div', { class: 'insighttitle', text: 'What to know' }), h('div', { class: 'insighttext', text: insight.rationale })) : null,
            insight.reviewSummary ? h('div', null, h('div', { class: 'insighttitle', text: 'Review summary' }), h('div', { class: 'insighttext', text: insight.reviewSummary })) : null,
            sentimentBar,
            sources.length ? h('div', { class: 'reviewsources' },
                h('div', { class: 'insighttitle', text: 'Review sources' }),
                sources.map(renderReviewSource)) : null));
        return details;
    }

    function renderInsightSourceChip(source) {
        const display = source.displayName || reviewSourceName(source.domain || source.title);
        const sentiment = String(source.sentiment || '').toLowerCase();
        return h('span', { class: `insightchip${sentiment ? ` ${sentiment}` : ''}`, title: [display, source.theme || source.title, sentiment ? sentimentLabel(sentiment) : ''].filter(Boolean).join(' \u00b7 ') },
            h('strong', { text: display }));
    }

    function renderReviewSource(source) {
        const display = source.displayName || reviewSourceName(source.domain || source.title);
        const displayLower = String(display).toLowerCase();
        const theme = String(source.theme || '').trim();
        const title = String(source.title || '').trim();
        const secondaryParts = [];
        if (theme && theme.toLowerCase() !== displayLower) secondaryParts.push(theme);
        else if (title && title.toLowerCase() !== displayLower) secondaryParts.push(title);
        if (source.rating != null && source.rating !== '') secondaryParts.push(`${source.rating}\u2605`);
        if (source.domain && source.domain.toLowerCase() !== displayLower && reviewSourceName(source.domain).toLowerCase() !== displayLower) secondaryParts.push(source.domain);
        const secondary = secondaryParts.join(' \u00b7 ');
        const sentiment = String(source.sentiment || '').toLowerCase();
        const props = { class: 'reviewrow', title: source.excerpt || source.snippet || source.url || '' };
        if (source.url) Object.assign(props, { href: source.url, target: '_blank', rel: 'noopener' });
        return h(source.url ? 'a' : 'div', props,
            h('span', { class: 'reviewrowmain' },
                h('span', { class: 'reviewname', text: display }),
                secondary ? h('span', { class: 'reviewmeta', text: secondary }) : null),
            sentiment ? h('span', { class: `senttag ${sentiment}` }, sentimentIcon(sentiment), sentimentLabel(sentiment)) : null);
    }

    function normalizeReviewSource(source) {
        if (!source) return null;
        const url = source.url || '';
        const rawDomain = source.domain || compactUrlLabel(url) || '';
        const domain = genericSourceLabel(rawDomain) ? '' : rawDomain;
        const rawName = source.displayName || source.name || source.siteName || source.site_name || source.publisher || source.sourceName || source.source_name || '';
        const name = genericSourceLabel(rawName) ? '' : String(rawName).trim();
        const rawTitle = source.title || source.name || '';
        const title = genericSourceLabel(rawTitle) ? '' : String(rawTitle).trim();
        const displayName = reviewSourceDisplayName(name, title, domain);
        if (!domain && !title && !name) return null;
        return Object.assign({}, source, { domain, name, title, displayName: displayName || name || title || domain });
    }

    function reviewSourcesForInsight(insight) {
        if (!insight) return [];
        return ((insight.reviews && insight.reviews.length) ? insight.reviews : (insight.sources || []))
            .map(normalizeReviewSource)
            .filter(Boolean)
            .filter(dedupeReviewSource());
    }

    function sourcedSentimentCounts(insight) {
        const counts = { positive: 0, neutral: 0, negative: 0 };
        reviewSourcesForInsight(insight).forEach((source) => {
            const sentiment = String(source.sentiment || '').toLowerCase();
            if (Object.prototype.hasOwnProperty.call(counts, sentiment)) counts[sentiment] += 1;
        });
        return counts;
    }

    function sentimentTotal(counts) {
        return (counts && counts.positive || 0) + (counts && counts.neutral || 0) + (counts && counts.negative || 0);
    }

    function dedupeReviewSource() {
        const seen = new Set();
        return (source) => {
            const key = `${source.domain || source.displayName}|${source.name || source.title || ''}|${source.sentiment || ''}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        };
    }

    function productInsightKey(product) {
        return [
            product.messageId || '',
            product.position ?? '',
            product.title || '',
            product.price || '',
        ].join('|');
    }

    function genericSourceLabel(value) {
        return /^(source|sources?|review|reviews?|citation|citations?|unknown|\?)$/i.test(String(value || '').trim());
    }

    function reviewSourceDisplayName(name, title, domain) {
        const preferred = [name, title].map((value) => String(value || '').trim()).find((value) => value && !looksLikeHostLabel(value));
        return preferred || reviewSourceName(domain || title || name);
    }

    function looksLikeHostLabel(value) {
        const text = String(value || '').trim().toLowerCase();
        return /^https?:\/\//.test(text) || /^[a-z0-9-]+(\.[a-z0-9-]+)+\/?$/.test(text);
    }

    function reviewSourceName(domain) {
        const host = String(domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
        const parts = host.split('.').filter(Boolean);
        const subdomainLabels = new Set(['m', 'mobile', 'en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'br', 'uk', 'ca', 'au']);
        const base = parts.length > 2 && subdomainLabels.has(parts[0]) ? parts[1] : (parts[0] || host);
        const known = { amazon: 'Amazon', aniforte: 'AniForte', appleinsider: 'AppleInsider', birchtree: 'Birchtree', fressnapf: 'Fressnapf', gsmarena: 'GSMArena', jamiebalfour: 'Jamie Balfour', trustpilot: 'Trustpilot', trustedreviews: 'Trusted Reviews', ubuy: 'Ubuy', wikipedia: 'Wikipedia', zooplus: 'zooplus' };
        return known[base] || base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function sentimentIcon(sentiment) {
        const icon = svgNode('svg', { class: 'senticon', viewBox: '0 0 24 24', width: '24', height: '24', color: 'currentColor', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
        if (sentiment === 'negative') {
            icon.appendChild(svgNode('path', { d: 'M2 11.5C2 12.6046 2.89543 13.5 4 13.5C5.65685 13.5 7 12.1569 7 10.5V6.5C7 4.84315 5.65685 3.5 4 3.5C2.89543 3.5 2 4.39543 2 5.5V11.5Z' }));
            icon.appendChild(svgNode('path', { d: 'M15.4787 16.1937L15.2124 15.3337C14.9942 14.6289 14.8851 14.2765 14.969 13.9982C15.0369 13.7731 15.1859 13.579 15.389 13.4513C15.64 13.2935 16.0197 13.2935 16.7791 13.2935H17.1831C19.7532 13.2935 21.0382 13.2935 21.6452 12.5327C21.7145 12.4458 21.7762 12.3533 21.8296 12.2563C22.2965 11.4079 21.7657 10.2649 20.704 7.9789C19.7297 5.88111 19.2425 4.83222 18.338 4.21485C18.2505 4.15508 18.1605 4.0987 18.0683 4.04586C17.116 3.5 15.9362 3.5 13.5764 3.5H13.0646C10.2057 3.5 8.77628 3.5 7.88814 4.36053C7 5.22106 7 6.60607 7 9.37607V10.3497C7 11.8054 7 12.5332 7.25834 13.1994C7.51668 13.8656 8.01135 14.4134 9.00069 15.5089L13.0921 20.0394C13.1947 20.1531 13.246 20.2099 13.2913 20.2493C13.7135 20.6167 14.3652 20.5754 14.7344 20.1577C14.774 20.1129 14.8172 20.0501 14.9036 19.9245C15.0388 19.728 15.1064 19.6297 15.1654 19.5323C15.6928 18.6609 15.8524 17.6256 15.6108 16.6429C15.5838 16.5331 15.5488 16.4199 15.4787 16.1937Z' }));
            return icon;
        }
        if (sentiment === 'neutral') {
            icon.appendChild(svgNode('path', { d: 'M7.6525 4.7864L7.47496 5.34293C7.32949 5.79895 7.25675 6.02697 7.31268 6.20705C7.35794 6.35273 7.45729 6.47831 7.59267 6.56093C7.76001 6.66306 8.01314 6.66306 8.51941 6.66306H8.78875C10.5021 6.66306 11.3588 6.66306 11.7634 7.15531C11.8097 7.21157 11.8508 7.27139 11.8864 7.33414C12.1977 7.88315 11.8438 8.62273 11.136 10.1019C10.4865 11.4593 10.1617 12.138 9.55868 12.5375C9.50031 12.5761 9.44032 12.6126 9.37886 12.6468C8.74403 13 7.95744 13 6.38427 13H6.04306C4.13715 13 3.18419 13 2.59209 12.4432C2 11.8864 2 10.9902 2 9.19784V8.56787C2 7.62594 2 7.15498 2.17223 6.72392C2.34445 6.29285 2.67424 5.93842 3.3338 5.22955L6.06141 2.29801C6.12982 2.22449 6.16403 2.18772 6.19418 2.16225C6.47569 1.92448 6.91015 1.95124 7.15627 2.22152C7.18264 2.25047 7.21145 2.29112 7.26908 2.37241C7.35922 2.49956 7.40429 2.56314 7.44357 2.62613C7.79522 3.19003 7.90162 3.85988 7.74053 4.4958C7.72254 4.56683 7.69918 4.64006 7.6525 4.7864Z' }));
            icon.appendChild(svgNode('path', { d: 'M16.3475 19.2136L16.525 18.6571C16.6705 18.201 16.7433 17.973 16.6873 17.793C16.6421 17.6473 16.5427 17.5217 16.4073 17.4391C16.24 17.3369 15.9869 17.3369 15.4806 17.3369H15.2113C13.4979 17.3369 12.6412 17.3369 12.2366 16.8447C12.1903 16.7884 12.1492 16.7286 12.1136 16.6659C11.8023 16.1168 12.1562 15.3773 12.864 13.8981C13.5135 12.5407 13.8383 11.862 14.4413 11.4625C14.4997 11.4239 14.5597 11.3874 14.6211 11.3532C15.256 11 16.0426 11 17.6157 11H17.9569C19.8629 11 20.8158 11 21.4079 11.5568C22 12.1136 22 13.0098 22 14.8022V15.4321C22 16.3741 22 16.845 21.8278 17.2761C21.6555 17.7071 21.3258 18.0616 20.6662 18.7705L17.9386 21.702C17.8702 21.7755 17.836 21.8123 17.8058 21.8378C17.5243 22.0755 17.0898 22.0488 16.8437 21.7785C16.8174 21.7495 16.7885 21.7089 16.7309 21.6276C16.6408 21.5004 16.5957 21.4369 16.5564 21.3739C16.2048 20.81 16.0984 20.1401 16.2595 19.5042C16.2775 19.4332 16.3008 19.3599 16.3475 19.2136Z' }));
            return icon;
        }
        icon.appendChild(svgNode('path', { d: 'M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z' }));
        icon.appendChild(svgNode('path', { d: 'M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z' }));
        return icon;
    }

    function sentimentLabel(sentiment) {
        if (sentiment === 'positive') return 'Positive';
        if (sentiment === 'negative') return 'Negative';
        return 'Neutral';
    }

    function renderProductCard(product) {
        const offers = (product.offers || []).slice().sort((a, b) => Number(isBestOffer(b)) - Number(isBestOffer(a)));
        const rating = productRatingText(product);
        const firstOfferLink = offers.find((offer) => usableProductUrl(offer.url) || offer.shoppingUrl) || {};
        const chosenUrl = usableProductUrl(product.providerUrl) || usableProductUrl(firstOfferLink.url) || '';
        const googleShoppingLink = marketShoppingUrl(product.googleShoppingCandidateUrl || '');
        const productUrl = chosenUrl || googleShoppingLink || marketShoppingUrl(firstOfferLink.shoppingUrl || '');
        const sourceLabel = primaryMerchantLabel(product.merchants) || compactUrlLabel(chosenUrl) || (firstOfferLink.shoppingUrl ? 'Google Shopping' : '');
        const offerActionLabel = product.offerLoading ? 'Loading offers...' : (offers.length ? 'Refresh offers' : 'Load offers');
        const insightActionLabel = product.insightLoading ? 'Loading insights...' : (product.sidebarInsight ? 'Refresh insights' : 'Load insights');
        const countryLanguage = productLocaleLabel(product);
        const googleMeta = [
            ['GPCID', product.googleGpcid],
            ['Merchant ID', product.googleMerchantId],
            ['Query', product.googleQuery],
            ['Country/lang', countryLanguage],
        ].filter(([, value]) => value);
        const image = product.image ? h('img', { class: 'thumb', src: product.image, loading: 'lazy', onError: function () { this.style.display = 'none'; } }) : null;
        const title = productUrl
            ? h('a', { class: 'ptitle plink', href: productUrl, target: '_blank', rel: 'noopener', title: productUrl, text: product.title || '(untitled)' })
            : h('div', { class: 'ptitle', text: product.title || '(untitled)' });
        return h('div', { class: 'pcard', 'data-filter-row': '1' },
            image && productUrl ? h('a', { class: 'thumblink', href: productUrl, target: '_blank', rel: 'noopener', title: productUrl }, image) : image,
            product.tag ? h('span', { class: 'pill', text: product.tag }) : null,
            title,
            product.price ? h('div', { class: 'price', text: product.price }) : null,
            rating ? h('div', { class: 'ratingline' }, starIcon(), h('span', { text: rating })) : null,
            product.description ? h('div', { class: 'desc', text: product.description }) : null,
            sourceLabel ? (productUrl
                ? h('a', { class: 'small sourcelink', href: productUrl, target: '_blank', rel: 'noopener', title: productUrl, text: sourceLabel })
                : h('div', { class: 'small', text: sourceLabel })) : null,
            googleMeta.length ? h('div', { class: 'gmeta' }, googleMeta.map(([label, value]) => h('div', { class: 'gmrow', title: String(value) }, h('b', { text: `${label}: ` }), String(value)))) : null,
            googleShoppingLink ? h('a', { class: 'shoppinglink', href: googleShoppingLink, target: '_blank', rel: 'noopener', title: googleShoppingLink, 'aria-label': 'View on Google Shopping' }, googleShoppingIcon(), h('span', { text: 'View on Google Shopping' })) : null,
            canLoadInsight(product) ? h('button', { class: 'btn offerbtn', type: 'button', disabled: (product.insightLoading || state.loadingInsights) ? 'disabled' : null, title: insightActionLabel, onClick: () => refreshProductInsight(product) }, refreshIcon(), h('span', { text: insightActionLabel })) : null,
            product.insightLoading ? h('div', { class: 'loadingline', style: { margin: '4px 0 0' } }, h('span', { class: 'dotspin' }), 'loading product insights...') : null,
            product.sidebarInsight ? renderProductInsight(product) : null,
            !product.sidebarInsight && product.insightError ? h('div', { class: 'small', text: 'product insights unavailable' }) : null,
            product.lookupKey ? h('button', { class: 'btn offerbtn', type: 'button', disabled: (product.offerLoading || state.loadingOffers) ? 'disabled' : null, title: offerActionLabel, onClick: () => refreshProductOffers(product) }, refreshIcon(), h('span', { text: offerActionLabel })) : null,
            ...offers.map((offer) => {
                const best = isBestOffer(offer);
                const shoppingFallback = marketShoppingUrl(offer.shoppingUrl || '');
                const offerUrl = usableProductUrl(offer.url) || shoppingFallback;
                const row = h('div', { class: `offer${best ? ' best' : ''}`, title: [offer.details, offer.tag, offer.url || (shoppingFallback ? `Google Shopping fallback: ${shoppingFallback}` : '')].filter(Boolean).join(' · ') },
                    h('span', null, best ? h('span', { class: 'bestmark', text: '●' }) : null, offer.merchant || 'merchant'),
                    h('strong', { text: offer.total || offer.price || offer.base || '' }));
                return offerUrl ? h('a', { class: 'offerlink', href: offerUrl, target: '_blank', rel: 'noopener', title: offer.url || `Google Shopping fallback: ${offerUrl}` }, row) : row;
            }),
            !offers.length && (state.loadingOffers || product.offerLoading) && product.lookupKey ? h('div', { class: 'loadingline', style: { margin: '4px 0 0' } }, h('span', { class: 'dotspin' }), 'loading live offers...') : null,
            !offers.length && product.offerError ? h('div', { class: 'small', text: product.offerError }) : null,
            !offers.length && !state.loadingOffers && product.lookupKey && !product.offerError ? h('div', { class: 'small', text: state.fromCache ? 'saved cache - refresh offers to update' : 'on-demand: click Load offers on this card' }) : null);
    }

    function mergeGoogleProductFields(target, source) {
        [
            'googleCatalogId',
            'googleProductId',
            'googleGpcid',
            'googleHeadlineOfferDocid',
            'googleImageDocid',
            'googleMerchantId',
            'googleRds',
            'googlePvt',
            'googleEi',
            'googleQuery',
            'googleGl',
            'googleHl',
            'googleUule',
            'googleLocaleSource',
            'googleShoppingCandidateUrl',
        ].forEach((key) => {
            if (source[key] != null && source[key] !== '') target[key] = source[key];
        });
    }

    function productLocaleLabel(product) {
        if (!product) return 'unknown';
        const exact = product.googleLocaleSource === 'metadata' || (!product.googleLocaleSource && product.googleUule);
        if (!exact) return 'unknown';
        const countryLanguage = [product.googleGl, product.googleHl]
            .filter(Boolean)
            .map((value) => String(value).toUpperCase())
            .join('/');
        return countryLanguage || (product.googleUule ? 'UULE captured' : 'unknown');
    }

    async function refreshProductInsight(product) {
        if (!state.intel || !product || !canLoadInsight(product) || product.insightLoading) return;
        product.insightLoading = true;
        product.insightError = '';
        setStatus(`loading insights: ${product.title || 'product'}...`);
        renderProductState();
        try {
            const insight = await CORE().loadProductSidebarInsight(product, state.intel.id, state.token, state.productMarket);
            product.sidebarInsight = insight;
            if (!await persistCurrentSnapshot('product insights updated and saved')) setStatus('product insights updated');
        } catch (error) {
            product.insightError = error.message;
            setStatus('product insights unavailable', true);
        } finally {
            product.insightLoading = false;
            renderProductState();
        }
    }

    async function hydrateInsights(options = {}) {
        if (!state.intel || state.loadingInsights) return;
        if (options.force) {
            state.intel.products.forEach((product) => {
                if (canLoadInsight(product)) {
                    product.sidebarInsight = null;
                    product.insightError = '';
                    product.insightLoading = false;
                }
            });
        }
        state.loadingInsights = true;
        state.insightProgress = 'starting product insight load...';
        renderProductState();
        setStatus('loading product insights...');
        const targets = state.intel.products.filter((product) => canLoadInsight(product) && !product.sidebarInsight);
        for (let i = 0; i < targets.length; i++) {
            state.insightProgress = `loading insights ${i + 1}/${targets.length}: ${targets[i].title || 'product'}`;
            setStatus(`loading insights ${i + 1}/${targets.length}...`);
            targets[i].insightLoading = true;
            renderProductState();
            try {
                targets[i].sidebarInsight = await CORE().loadProductSidebarInsight(targets[i], state.intel.id, state.token, state.productMarket);
            } catch (error) {
                targets[i].insightError = error.message;
            } finally {
                targets[i].insightLoading = false;
            }
            await new Promise((resolve) => setTimeout(resolve, 350));
        }
        state.loadingInsights = false;
        state.insightProgress = '';
        if (!await persistCurrentSnapshot('product insights updated and saved')) setStatus('product insights updated');
        renderProductState();
    }

    async function refreshProductOffers(product) {
        if (!state.intel || !product || !product.lookupKey || product.offerLoading) return;
        product.offerLoading = true;
        product.offerError = '';
        product.offers = [];
        setStatus(`loading offers: ${product.title || 'product'}...`);
        renderOfferState();
        try {
            const live = await CORE().loadProductOffers(product, state.token, state.productMarket);
            if (live) {
                if (live.providerUrl) product.providerUrl = live.providerUrl;
                mergeGoogleProductFields(product, live);
                if (live.rating != null && live.rating !== '') product.rating = live.rating;
                if (live.reviews != null && live.reviews !== '') product.reviews = live.reviews;
            }
            if (live && live.offers && live.offers.length) {
                product.offers = live.offers;
            } else {
                product.offers = [];
                product.offerError = 'Offers unavailable for this account/product.';
            }
            if (!await persistCurrentSnapshot('offers updated and saved')) setStatus('offers updated');
        } catch (error) {
            product.offers = [];
            product.offerError = error.message;
            setStatus('offer reload failed', true);
        } finally {
            product.offerLoading = false;
            renderOfferState();
        }
    }

    async function hydrateOffers(options = {}) {
        if (!state.intel || state.loadingOffers) return;
        if (options.force) {
            state.intel.products.forEach((product) => {
                if (product.lookupKey) {
                    product.offers = [];
                    product.offerError = '';
                    product.offerLoading = false;
                }
            });
        }
        state.loadingOffers = true;
        state.offerProgress = 'starting live offer load...';
        renderOfferState();
        setStatus('loading live offers...');
        const targets = state.intel.products.filter((product) => product.lookupKey && !(product.offers && product.offers.length));
        for (let i = 0; i < targets.length; i++) {
            state.offerProgress = `loading offers ${i + 1}/${targets.length}: ${targets[i].title || 'product'}`;
            setStatus(`loading offers ${i + 1}/${targets.length}...`);
            targets[i].offerLoading = true;
            renderOfferState();
            try {
                const live = await CORE().loadProductOffers(targets[i], state.token, state.productMarket);
                if (live) {
                    if (live.providerUrl) targets[i].providerUrl = live.providerUrl;
                    mergeGoogleProductFields(targets[i], live);
                    if (live.rating != null && live.rating !== '') targets[i].rating = live.rating;
                    if (live.reviews != null && live.reviews !== '') targets[i].reviews = live.reviews;
                }
                if (live && live.offers && live.offers.length) {
                    targets[i].offers = live.offers;
                } else {
                    targets[i].offers = [];
                    targets[i].offerError = 'Offers unavailable for this account/product.';
                }
            } catch (error) {
                targets[i].offerError = error.message;
            } finally {
                targets[i].offerLoading = false;
            }
            await new Promise((resolve) => setTimeout(resolve, 350));
        }
        state.loadingOffers = false;
        state.offerProgress = '';
        if (!await persistCurrentSnapshot('offers updated and saved')) setStatus('offers updated');
        renderOfferState();
    }

    async function persistCurrentSnapshot(message) {
        if (!state.intel || !state.intel.id || !state.intel.scannedAt) return false;
        try {
            const snapshotId = `${state.intel.id}:${state.intel.scannedAt}`;
            const saved = await CORE().updateSnapshot(snapshotId, { intel: state.intel, stats: state.intel.stats });
            if (!saved) return false;
            setStatus(message || 'saved scan updated');
            return true;
        } catch (_) {
            return false;
        }
    }

    function renderReasoning() {
        const blocks = [];
        if (state.intel.reasoningRecap) blocks.push(h('div', { class: 'reason', 'data-filter-row': '1' }, h('b', { text: 'Reasoning recap' }), h('pre', { text: state.intel.reasoningRecap })));
        state.intel.reasoning.forEach((item, index) => blocks.push(h('div', { class: 'reason', 'data-filter-row': '1' }, h('b', { text: item.summary || `Reasoning step ${index + 1}` }), h('pre', { text: item.content || '' }))));
        state.intel.memory.forEach((item) => blocks.push(h('div', { class: 'reason', 'data-filter-row': '1' }, h('b', { text: `${item.attribution}: ${item.title || 'memory'}` }), h('pre', { text: item.snippet || '' }))));
        return blocks.length ? h('div', null, blocks) : h('div', { class: 'empty' }, 'No reasoning or memory metadata was exposed for this conversation.');
    }

    function renderSaved() {
        const mount = h('div', { class: 'empty' }, 'Loading saved scans...');
        CORE().loadLibrary().then((library) => renderSavedLibrary(mount, library))
            .catch((error) => mount.replaceChildren(h('div', { class: 'empty' }, error.message)));
        return mount;
    }

    function renderSavedLibrary(mount, library) {
        const snapshots = library.snapshots || [];
        const projects = library.projects || [];
        const tags = library.tags || [];
        const projectMap = new Map(projects.map((project) => [project.id, project]));
        const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
        const filtered = snapshots.filter((snapshot) => {
            if (state.savedFilters.projectId && snapshot.projectId !== state.savedFilters.projectId) return false;
            if (state.savedFilters.tagId && !(snapshot.tags || []).includes(state.savedFilters.tagId)) return false;
            return true;
        });
        const fileInput = h('input', { class: 'importfile', type: 'file', accept: 'application/json,.json', onChange: (event) => importSavedFile(event.target) });
        const controls = h('div', { class: 'savedbar' },
            h('div', { class: 'savedfilters' },
                h('select', { class: 'select', value: state.savedFilters.projectId, onChange: (event) => { state.savedFilters.projectId = event.target.value; render(); } },
                    h('option', { value: '', text: 'All projects' }),
                    projects.map((project) => h('option', { value: project.id, selected: state.savedFilters.projectId === project.id ? 'selected' : null, text: project.name }))),
                h('select', { class: 'select', value: state.savedFilters.tagId, onChange: (event) => { state.savedFilters.tagId = event.target.value; render(); } },
                    h('option', { value: '', text: 'All tags' }),
                    tags.map((tag) => h('option', { value: tag.id, selected: state.savedFilters.tagId === tag.id ? 'selected' : null, text: tag.name })))),
            h('div', { class: 'savedtools' },
                h('button', { class: 'btn secondary', onClick: createProjectFromPrompt }, 'New project'),
                h('button', { class: 'btn secondary', onClick: createTagFromPrompt }, 'New tag'),
                h('button', { class: 'btn', onClick: openLibraryManagementModal }, 'Manage'),
                snapshots.length > 1 ? h('button', { class: 'btn secondary', onClick: () => openCompareModal(snapshots) }, 'Compare runs') : null,
                h('button', { class: 'btn', onClick: () => fileInput.click() }, 'Import'),
                h('details', { class: 'exportmenu' },
                    h('summary', { class: 'btn' }, 'Export', chevronIcon()),
                    h('div', { class: 'exportitems' },
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportSavedJson(snapshots, projects, tags, 'all'); } }, 'All saved JSON'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportSavedJson(filtered, projects, tags, 'filtered'); } }, 'Filtered JSON'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportSavedSourcesCsv(snapshots, projects, tags); } }, 'All sources CSV'),
                        h('button', { class: 'exportitem', onClick: (event) => { closeExportMenu(event); exportSavedProductsCsv(snapshots, projects, tags); } }, 'All products CSV'))),
                fileInput));

        if (!snapshots.length) {
            mount.className = '';
            mount.replaceChildren(controls, h('div', { class: 'empty' }, 'No saved scans yet.'));
            return;
        }
        if (!filtered.length) {
            mount.className = '';
            mount.replaceChildren(controls, h('div', { class: 'empty' }, 'No saved scans match the selected filters.'));
            return;
        }
        mount.className = '';
        mount.replaceChildren(
            controls,
            h('div', { class: 'savedlist' },
                h('div', { class: 'savedhead' },
                    h('span', { text: 'chat' }),
                    h('span', { text: 'saved' }),
                    h('span', { text: 'project & tags' }),
                    h('span', { text: 'captured' }),
                    h('span', { text: 'actions' })),
                filtered.map((snapshot) => renderSavedRow(snapshot, projects, tags, projectMap, tagMap))));
    }

    function compareIntel(intelA, intelB) {
        const urls = (intel) => new Set(((intel && intel.sources) || []).map((source) => (source.url || '').replace(/[#?].*$/, '')).filter(Boolean));
        const isHostname = (value) => /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(String(value || '').trim());
        const domains = (intel) => new Set(((intel && intel.sources) || []).map((source) => source.domain).filter(isHostname));
        const citedDomains = (intel) => new Set(((intel && intel.citations) || []).map((citation) => citation.domain).filter(Boolean));
        const jaccard = (setA, setB) => {
            if (!setA.size && !setB.size) return null;
            let shared = 0;
            setA.forEach((value) => { if (setB.has(value)) shared += 1; });
            return shared / (setA.size + setB.size - shared);
        };
        const mix = (intel) => {
            const raw = (intel && intel.stats && intel.stats.pipelineMix) || {};
            const normalized = {};
            Object.keys(raw).forEach((key) => {
                const pipeline = formatPipeline(key);
                const value = Number(raw[key] || 0);
                normalized[pipeline] = (normalized[pipeline] || 0) + (Number.isFinite(value) ? value : 0);
            });
            return normalized;
        };
        const primary = (intel) => formatPipeline(intel && intel.stats && intel.stats.primaryPipeline);
        const domainsA = domains(intelA);
        const domainsB = domains(intelB);
        const onlyA = [...domainsA].filter((domain) => !domainsB.has(domain));
        const onlyB = [...domainsB].filter((domain) => !domainsA.has(domain));
        const shared = [...domainsA].filter((domain) => domainsB.has(domain));
        return {
            primaryA: primary(intelA), primaryB: primary(intelB),
            routingChanged: primary(intelA) !== primary(intelB),
            mixA: mix(intelA), mixB: mix(intelB),
            urlOverlap: jaccard(urls(intelA), urls(intelB)),
            domainOverlap: jaccard(domainsA, domainsB),
            citedOverlap: jaccard(citedDomains(intelA), citedDomains(intelB)),
            onlyA, onlyB, shared,
        };
    }

    function openCompareModal(snapshots) {
        ensureHost();
        const shade = h('div', { class: 'orgshade' });
        const results = h('div', { class: 'cmpresults' });
        const option = (snapshot, selectedId) => h('option', { value: snapshot.id, selected: snapshot.id === selectedId ? 'selected' : null, text: `${snapshot.title || '(untitled)'} — ${new Date(snapshot.scannedAt).toLocaleString()}` });
        let idA = snapshots[0].id;
        let idB = (snapshots[1] || snapshots[0]).id;
        const selectA = h('select', { class: 'select', onChange: (event) => { idA = event.target.value; draw(); } }, snapshots.map((snapshot) => option(snapshot, idA)));
        const selectB = h('select', { class: 'select', onChange: (event) => { idB = event.target.value; draw(); } }, snapshots.map((snapshot) => option(snapshot, idB)));

        const overlapCard = (value, label) => h('div', { class: 'cmpstat' },
            h('div', { class: 'cmpnum', text: value == null ? 'n/a' : `${Math.round(value * 100)}%` }),
            h('div', { class: 'cmplbl', text: label }),
            h('div', { class: 'cmptrack' }, h('div', { class: 'cmpfill', style: { width: `${Math.max(2, Math.round((value || 0) * 100))}%` } })));
        const mixCard = (label, snapshot, mixCounts) => {
            const total = Object.values(mixCounts).reduce((sum, count) => sum + count, 0);
            const keys = Object.keys(mixCounts).sort((left, right) => mixCounts[right] - mixCounts[left]);
            const stats = (snapshot.intel && snapshot.intel.stats) || snapshot.stats || {};
            return h('div', { class: 'cmpcard' },
                h('span', { class: 'eyebrow', text: label }),
                total ? h('div', { class: 'mixbar' }, keys.map((key) => h('div', { class: 'mixseg', title: `${key} ${Math.round(mixCounts[key] / total * 100)}%`, style: { width: `${mixCounts[key] / total * 100}%`, background: pipelineColor(key) } }))) : null,
                total ? h('div', { class: 'mixlegend' }, keys.map((key) => h('span', null, h('i', { class: 'pipedot', style: { display: 'inline-block', background: pipelineColor(key), marginRight: '4px', verticalAlign: 'middle' } }), `${key} ${Math.round(mixCounts[key] / total * 100)}%`))) : h('div', { class: 'rmeta' }, 'no sources captured'),
                h('div', { class: 'cmpcounts' }, h('b', { text: String(stats.sources || 0) }), ' sources  ·  ', h('b', { text: String(stats.citations || 0) }), ' citations  ·  ', h('b', { text: String(stats.queries || 0) }), ' fan-out'));
        };
        const cloud = (label, items, shared) => h('div', { class: 'cmpsec' },
            h('span', { class: 'eyebrow', text: `${label} (${items.length})` }),
            items.length ? h('div', { class: 'domscroll' }, h('div', { class: 'domlist' },
                items.slice(0, 120).map((domain) => h('span', { class: shared ? 'shared' : null, title: domain, text: domain })),
                items.length > 120 ? h('span', { class: 'more', text: `+${items.length - 120} more` }) : null))
                : h('div', { class: 'rmeta' }, '—'));
        const normalizePrompt = (snapshot) => String(snapshot.prompt || (snapshot.intel && snapshot.intel.prompt) || '').trim().toLowerCase();

        const draw = () => {
            const snapshotA = snapshots.find((snapshot) => snapshot.id === idA);
            const snapshotB = snapshots.find((snapshot) => snapshot.id === idB);
            if (!snapshotA || !snapshotB) return;
            if (snapshotA.id === snapshotB.id) {
                results.replaceChildren(h('div', { class: 'small', style: { margin: '8px 0' } }, 'Pick two different saved scans to compare.'));
                return;
            }
            const compared = compareIntel(snapshotA.intel, snapshotB.intel);
            const differentPrompts = normalizePrompt(snapshotA) && normalizePrompt(snapshotB) && normalizePrompt(snapshotA) !== normalizePrompt(snapshotB);
            const blocks = [
                h('div', { class: 'cmproute' },
                    h('i', { class: 'pipedot', style: { background: pipelineColor(compared.primaryA) } }),
                    h('b', { text: compared.primaryA }),
                    arrowRightIcon(),
                    h('i', { class: 'pipedot', style: { background: pipelineColor(compared.primaryB) } }),
                    h('b', { text: compared.primaryB }),
                    h('span', { class: 'routediv' }),
                    h('span', { class: `routestatus ${compared.routingChanged ? 'changed' : 'stable'}`, text: compared.routingChanged ? 'routing changed' : 'routing stable' })),
                differentPrompts ? h('div', { class: 'rnote' }, 'These scans come from different prompts, so low overlap is expected and mostly reflects topic difference. Overlap metrics are most meaningful between repeated runs of the same prompt.') : null,
                compared.routingChanged && !differentPrompts ? h('div', { class: 'rnote' }, 'Primary search source differs between these runs. Published telemetry research found routing changes cut URL overlap by roughly 45% — treat these runs as drawing on different retrieval ecosystems rather than a re-roll of the same one.') : null,
                h('div', { class: 'cmpstats' },
                    overlapCard(compared.urlOverlap, 'URL overlap'),
                    overlapCard(compared.domainOverlap, 'domain overlap'),
                    overlapCard(compared.citedOverlap, 'cited-domain overlap')),
                h('div', { class: 'cmpcols' },
                    mixCard('Run A source mix', snapshotA, compared.mixA),
                    mixCard('Run B source mix', snapshotB, compared.mixB)),
                cloud('Shared domains', compared.shared, true),
                cloud('Only in A', compared.onlyA, false),
                cloud('Only in B', compared.onlyB, false),
            ].filter(Boolean);
            results.replaceChildren(...blocks);
        };
        const closeModal = () => shade.remove();
        const panel = h('div', { class: 'orgmodal wide', role: 'dialog', 'aria-modal': 'true' },
            h('div', { class: 'orghead' },
                h('div', null,
                    h('h3', { class: 'orgtitle', text: 'Compare runs' }),
                    h('div', { class: 'orgsub', text: 'How retrieval differed between two saved scans: search-source routing, evidence overlap, and which domains only one run surfaced.' })),
                h('button', { class: 'btn x', 'aria-label': 'Close', onClick: closeModal }, closeIcon())),
            h('div', { class: 'cmpcols', style: { marginTop: '0' } },
                h('div', { class: 'orgfield' }, h('label', { text: 'Run A' }), selectA),
                h('div', { class: 'orgfield' }, h('label', { text: 'Run B' }), selectB)),
            results,
            h('div', { class: 'orgactions' }, h('button', { class: 'btn primary', type: 'button', onClick: closeModal }, 'Done')));
        shade.appendChild(panel);
        shade.addEventListener('click', (event) => { if (event.target === shade) closeModal(); });
        state.overlay.appendChild(shade);
        draw();
    }

    function renderSavedRow(snapshot, projects, tags, projectMap, tagMap) {
        const assignedTags = (snapshot.tags || []).map((id) => tagMap.get(id)).filter(Boolean);
        return h('div', { class: 'savedrow', 'data-filter-row': '1' },
            h('div', null,
                h('div', { class: 'savedtitle', title: snapshot.title || '(untitled)', text: snapshot.title || '(untitled)' }),
                snapshot.prompt ? h('div', { class: 'small', title: snapshot.prompt, text: snapshot.prompt }) : null,
                snapshot.notes ? h('div', { class: 'notes', title: snapshot.notes, text: snapshot.notes }) : null),
            h('div', { class: 'savedmeta', text: new Date(snapshot.scannedAt).toLocaleString() }),
            h('div', { class: 'savedorg' },
                h('select', { class: `select inline${snapshot.projectId ? '' : ' noproject'}`, title: 'Assign to a project', value: snapshot.projectId || '', onChange: async (event) => { await CORE().updateSnapshot(snapshot.id, { projectId: event.target.value || null }); render(); } },
                    h('option', { value: '', text: 'No project' }),
                    projects.map((project) => h('option', { value: project.id, selected: snapshot.projectId === project.id ? 'selected' : null, text: project.name }))),
                h('div', { class: 'tagline' },
                    assignedTags.map((tag) => h('span', { class: 'tagchip', title: tag.name, style: tagStyle(tag), text: tag.name })),
                    h('button', { class: 'addtag', type: 'button', title: 'Edit project, tags, and notes', onClick: () => organizeSavedSnapshot(snapshot) }, assignedTags.length ? '+ tag' : '+ add tags'))),
            h('div', { class: 'savedstats' },
                snapshot.stats.primaryPipeline ? h('span', { title: 'primary search source for this run' }, h('b', { text: formatPipeline(snapshot.stats.primaryPipeline) }), ` ${snapshot.stats.primaryPipelineShare || 0}%`) : null,
                h('span', null, h('b', { text: snapshot.stats.sources || 0 }), ' sources'),
                h('span', null, h('b', { text: snapshot.stats.citations || 0 }), ' citations'),
                h('span', null, h('b', { text: snapshot.stats.products || 0 }), ' products')),
            h('div', { class: 'savedacts' },
                h('button', { class: 'btn', onClick: () => { loadCachedSnapshot(snapshot); setStatus('loaded saved cache'); render(); } }, 'Open'),
                h('button', { class: 'btn ghost', onClick: () => organizeSavedSnapshot(snapshot) }, 'Organize'),
                h('button', { class: 'btn danger', onClick: async () => { await CORE().deleteSnapshot(snapshot.id); state.activeTab = 'saved'; render(); } }, 'Delete')));
    }

    async function createProjectFromPrompt() {
        const result = await openOrganizationModal({ title: 'Create project', mode: 'project' });
        if (result) render();
    }

    async function createTagFromPrompt() {
        const result = await openOrganizationModal({ title: 'Create tag', mode: 'tag' });
        if (result) render();
    }

    async function openLibraryManagementModal() {
        ensureHost();
        let library = await CORE().loadLibrary();
        let pendingDelete = '';
        const shade = h('div', { class: 'orgshade' });
        const body = h('div', { class: 'managebody' });
        const status = h('div', { class: 'orgstatus' });

        const close = () => {
            shade.remove();
            if (state.activeTab === 'saved') render();
        };
        const refresh = async (message) => {
            library = await CORE().loadLibrary();
            pendingDelete = '';
            status.textContent = message || '';
            draw();
        };
        const usage = (kind, id) => {
            const snapshots = library.snapshots || [];
            if (kind === 'project') return snapshots.filter((snapshot) => snapshot.projectId === id).length;
            return snapshots.filter((snapshot) => (snapshot.tags || []).includes(id)).length;
        };
        const deleteLabel = (kind, id) => pendingDelete === `${kind}:${id}` ? 'Confirm delete' : 'Delete';
        const deleteItem = async (kind, item) => {
            const key = `${kind}:${item.id}`;
            if (pendingDelete !== key) {
                pendingDelete = key;
                draw();
                return;
            }
            if (kind === 'project') {
                await CORE().deleteProject(item.id);
                if (state.savedFilters.projectId === item.id) state.savedFilters.projectId = '';
            } else {
                await CORE().deleteTag(item.id);
                if (state.savedFilters.tagId === item.id) state.savedFilters.tagId = '';
            }
            await refresh(`${kind === 'project' ? 'Project' : 'Tag'} deleted`);
        };
        const draw = () => {
            const projectRows = (library.projects || []).map((project) => {
                const input = h('input', { class: 'orginput', value: project.name });
                return h('div', { class: 'managerow' },
                    input,
                    h('div', { class: 'managecount', text: `${usage('project', project.id)} scans` }),
                    h('button', { class: 'btn secondary', onClick: async () => {
                        try {
                            await CORE().updateProject(project.id, { name: input.value });
                            await refresh('Project updated');
                        } catch (error) {
                            status.textContent = error.message;
                        }
                    } }, 'Save'),
                    h('button', { class: 'btn danger', onClick: async () => {
                        try {
                            await deleteItem('project', project);
                        } catch (error) {
                            status.textContent = error.message;
                        }
                    } }, deleteLabel('project', project.id)));
            });
            const tagRows = (library.tags || []).map((tag) => {
                const input = h('input', { class: 'orginput', value: tag.name });
                const color = h('input', { class: 'orgcolor', type: 'color', value: /^#[0-9a-f]{6}$/i.test(tag.color || '') ? tag.color : '#2563eb' });
                return h('div', { class: 'managerow tag' },
                    input,
                    color,
                    h('div', { class: 'managecount', text: `${usage('tag', tag.id)} scans` }),
                    h('button', { class: 'btn secondary', onClick: async () => {
                        try {
                            await CORE().updateTag(tag.id, { name: input.value, color: color.value });
                            await refresh('Tag updated');
                        } catch (error) {
                            status.textContent = error.message;
                        }
                    } }, 'Save'),
                    h('button', { class: 'btn danger', onClick: async () => {
                        try {
                            await deleteItem('tag', tag);
                        } catch (error) {
                            status.textContent = error.message;
                        }
                    } }, deleteLabel('tag', tag.id)));
            });
            body.replaceChildren(
                h('div', { class: 'managesec' },
                    h('div', { class: 'eyebrow', text: 'Projects' }),
                    projectRows.length ? projectRows : h('div', { class: 'small', text: 'No projects yet.' })),
                h('div', { class: 'managesec' },
                    h('div', { class: 'eyebrow', text: 'Tags' }),
                    tagRows.length ? tagRows : h('div', { class: 'small', text: 'No tags yet.' })));
        };

        const panel = h('div', { class: 'orgmodal wide', role: 'dialog', 'aria-modal': 'true' },
            h('div', { class: 'orghead' },
                h('div', null,
                    h('h3', { class: 'orgtitle', text: 'Manage projects and tags' }),
                    h('div', { class: 'orgsub', text: 'Rename or delete local organization labels. Deleted projects/tags are removed from saved scans.' })),
                h('button', { class: 'btn x', 'aria-label': 'Close', onClick: close }, closeIcon())),
            body,
            status,
            h('div', { class: 'orgactions' }, h('button', { class: 'btn primary', type: 'button', onClick: close }, 'Done')));
        shade.appendChild(panel);
        shade.addEventListener('click', (event) => {
            if (event.target === shade) close();
        });
        state.overlay.appendChild(shade);
        draw();
    }

    async function organizeSavedSnapshot(snapshot) {
        const result = await openOrganizationModal({
            title: 'Organize saved scan',
            subtitle: snapshot.title || '(untitled)',
            initial: snapshot,
        });
        if (!result) return;
        try {
            await CORE().updateSnapshot(snapshot.id, result);
            setStatus('saved scan updated');
            render();
        } catch (error) {
            setStatus(error.message, true);
        }
    }

    async function openOrganizationModal(options = {}) {
        ensureHost();
        const library = await CORE().loadLibrary();
        let projects = library.projects || [];
        let tags = library.tags || [];
        let selectedProjectId = (options.initial && options.initial.projectId) || '';
        const selectedTags = new Set((options.initial && options.initial.tags) || []);
        const projectListId = `project-list-${Date.now()}`;
        const tagListId = `tag-list-${Date.now()}`;
        const shade = h('div', { class: 'orgshade' });
        const projectSelect = h('select', { class: 'select', onChange: (event) => { selectedProjectId = event.target.value; } },
            h('option', { value: '', text: 'No project' }),
            projects.map((project) => h('option', { value: project.id, selected: selectedProjectId === project.id ? 'selected' : null, text: project.name })));
        const projectInput = h('input', { class: 'orginput', list: projectListId, placeholder: 'Create or find project' });
        const tagInput = h('input', { class: 'orginput', list: tagListId, placeholder: 'Add or create tag' });
        const tagColor = h('input', { class: 'orgcolor', type: 'color', value: '#2563eb', title: 'New tag color' });
        const tagSelect = h('select', { class: 'select' },
            h('option', { value: '', text: 'Existing tag' }),
            tags.map((tag) => h('option', { value: tag.id, text: tag.name })));
        const notes = h('textarea', { class: 'orgtextarea', text: (options.initial && options.initial.notes) || '' });
        const tagChips = h('div', { class: 'orgchips' });
        const projectDatalist = h('datalist', { id: projectListId }, projects.map((project) => h('option', { value: project.name })));
        const tagDatalist = h('datalist', { id: tagListId }, tags.map((tag) => h('option', { value: tag.name })));
        const status = h('div', { class: 'orgstatus' });

        const refreshProjects = () => {
            projectSelect.replaceChildren(
                h('option', { value: '', text: 'No project' }),
                ...projects.map((project) => h('option', { value: project.id, selected: selectedProjectId === project.id ? 'selected' : null, text: project.name }))
            );
            projectSelect.value = selectedProjectId;
            projectDatalist.replaceChildren(...projects.map((project) => h('option', { value: project.name })));
        };
        const refreshTags = () => {
            tagSelect.replaceChildren(h('option', { value: '', text: 'Existing tag' }), ...tags.map((tag) => h('option', { value: tag.id, text: tag.name })));
            tagDatalist.replaceChildren(...tags.map((tag) => h('option', { value: tag.name })));
            tagChips.replaceChildren(...Array.from(selectedTags).map((id) => {
                const tag = tags.find((item) => item.id === id);
                if (!tag) return null;
                return h('span', { class: 'orgchip', style: tagStyle(tag) },
                    h('span', { text: tag.name }),
                    h('button', { type: 'button', onClick: () => { selectedTags.delete(id); refreshTags(); } }, 'x'));
            }).filter(Boolean));
        };
        const addTagByName = async (name) => {
            const clean = String(name || '').trim();
            if (!clean) return;
            let tag = tags.find((item) => item.name.toLowerCase() === clean.toLowerCase());
            if (!tag) {
                tag = await CORE().createTag(clean, tagColor.value || '#2563eb');
                tags = await CORE().loadTags();
            }
            selectedTags.add(tag.id);
            tagInput.value = '';
            tagSelect.value = '';
            refreshTags();
        };
        const useProjectInput = async () => {
            const name = projectInput.value.trim();
            if (!name) return;
            const existing = projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
            const project = existing || await CORE().createProject(name);
            projects = await CORE().loadProjects();
            selectedProjectId = project.id;
            projectInput.value = '';
            refreshProjects();
            status.textContent = existing ? `Selected project: ${project.name}` : `Created and selected project: ${project.name}`;
        };
        const close = (value) => {
            shade.remove();
            resolveModal(value);
        };
        let resolveModal;
        const promise = new Promise((resolve) => { resolveModal = resolve; });

        const panel = h('div', { class: 'orgmodal', role: 'dialog', 'aria-modal': 'true' },
            h('div', { class: 'orghead' },
                h('div', null,
                    h('h3', { class: 'orgtitle', text: options.title || 'Organize scan' }),
                    h('div', { class: 'orgsub', text: options.subtitle || 'Choose project, tags, and notes before saving.' })),
                h('button', { class: 'btn x', 'aria-label': 'Close', onClick: () => close(null) }, closeIcon())),
            h('div', { class: 'orggrid' },
                h('div', { class: 'orgfield' },
                    h('label', { text: 'Project' }),
                    h('div', { class: 'orgrow' }, projectSelect, h('button', { class: 'btn secondary', type: 'button', onClick: async () => {
                        try {
                            await useProjectInput();
                        } catch (error) {
                            status.textContent = error.message;
                        }
                    } }, 'Create')),
                    projectInput,
                    projectDatalist,
                    h('div', { class: 'orghint', text: 'Pick an existing project from the dropdown, or type a new project name and create it.' })),
                h('div', { class: 'orgfield' },
                    h('label', { text: 'Tags' }),
                    h('div', { class: 'orgrow' }, tagSelect, h('button', { class: 'btn secondary', type: 'button', onClick: () => { if (tagSelect.value) { selectedTags.add(tagSelect.value); refreshTags(); } } }, 'Add selected')),
                    h('div', { class: 'orgrow tags' }, tagInput, h('button', { class: 'btn secondary', type: 'button', onClick: () => addTagByName(tagInput.value) }, 'Add/create'), tagColor),
                    tagDatalist,
                    h('div', { class: 'orghint', text: 'Tags are saved as colored labels. Use the color swatch when creating a new tag.' }),
                    tagChips),
                h('div', { class: 'orgfield' },
                    h('label', { text: 'Notes' }),
                    notes),
                status),
            h('div', { class: 'orgactions' },
                h('button', { class: 'btn ghost', type: 'button', onClick: () => close(null) }, 'Cancel'),
                h('button', { class: 'btn primary', type: 'button', onClick: async () => {
                    try {
                        if (projectInput.value.trim()) await useProjectInput();
                        if (tagInput.value.trim()) await addTagByName(tagInput.value);
                        close({ projectId: selectedProjectId || null, tags: Array.from(selectedTags), notes: notes.value || '' });
                    } catch (error) {
                        status.textContent = error.message;
                    }
                } }, options.actionText || (options.mode ? 'Done' : (options.initial && options.initial.id ? 'Update scan' : 'Save scan')))));
        shade.appendChild(panel);
        shade.addEventListener('click', (event) => {
            if (event.target === shade) close(null);
        });
        state.overlay.appendChild(shade);
        refreshProjects();
        refreshTags();
        projectInput.focus();
        return promise;
    }

    function savedContext(snapshot, projectMap, tagMap) {
        return {
            savedId: snapshot.id,
            conversationId: snapshot.conversationId,
            title: snapshot.title,
            scannedAt: snapshot.scannedAt,
            project: snapshot.projectId && projectMap.get(snapshot.projectId) ? projectMap.get(snapshot.projectId).name : '',
            tags: (snapshot.tags || []).map((id) => tagMap.get(id)).filter(Boolean).map((tag) => tag.name).join('; '),
        };
    }

    function exportSavedJson(snapshots, projects, tags, scope) {
        const payload = { version: 2, exportedAt: new Date().toISOString(), snapshots, projects, tags };
        download(`geo-aeo-saved-${scope}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
    }

    function exportSavedSourcesCsv(snapshots, projects, tags) {
        const projectMap = new Map(projects.map((project) => [project.id, project]));
        const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
        const rows = snapshots.flatMap((snapshot) => {
            const ctx = savedContext(snapshot, projectMap, tagMap);
            return ((snapshot.intel && snapshot.intel.sources) || []).map((source) => ({ ...ctx, ...source }));
        });
        download(`geo-aeo-saved-sources-${new Date().toISOString().slice(0, 10)}.csv`, CORE().toCsv(rows), 'text/csv');
    }

    function exportSavedProductsCsv(snapshots, projects, tags) {
        const projectMap = new Map(projects.map((project) => [project.id, project]));
        const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
        const rows = snapshots.flatMap((snapshot) => {
            const ctx = savedContext(snapshot, projectMap, tagMap);
            return ((snapshot.intel && snapshot.intel.products) || []).map((product) => {
                const sentiment = sourcedSentimentCounts(product.sidebarInsight);
                const reviewSources = reviewSourcesForInsight(product.sidebarInsight);
                return {
                    ...ctx,
                    title: product.title,
                    price: product.price,
                    tag: product.tag,
                    merchants: product.merchants,
                    rating: product.rating,
                    reviews: product.reviews,
                    query: product.query,
                    providerUrl: product.providerUrl,
                    googleCatalogId: product.googleCatalogId,
                    googleProductId: product.googleProductId,
                    googleGpcid: product.googleGpcid,
                    googleHeadlineOfferDocid: product.googleHeadlineOfferDocid,
                    googleImageDocid: product.googleImageDocid,
                    googleMerchantId: product.googleMerchantId,
                    googleRds: product.googleRds,
                    googlePvt: product.googlePvt,
                    googleEi: product.googleEi,
                    googleQuery: product.googleQuery,
                    googleGl: product.googleGl,
                    googleHl: product.googleHl,
                    googleUule: product.googleUule,
                    googleLocaleSource: product.googleLocaleSource || 'missing',
                    googleShoppingCandidateUrl: product.googleShoppingCandidateUrl,
                    googleShoppingUrlWithMarket: marketShoppingUrl(product.googleShoppingCandidateUrl || ''),
                    offers: (product.offers || []).length,
                    rationale: product.sidebarInsight && product.sidebarInsight.rationale || '',
                    reviewSummary: product.sidebarInsight && product.sidebarInsight.reviewSummary || '',
                    sentimentPositive: sentiment.positive,
                    sentimentNeutral: sentiment.neutral,
                    sentimentNegative: sentiment.negative,
                    sidebarSourceCount: reviewSources.length,
                };
            });
        });
        download(`geo-aeo-saved-products-${new Date().toISOString().slice(0, 10)}.csv`, CORE().toCsv(rows), 'text/csv');
    }

    function importSavedFile(input) {
        const file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const payload = JSON.parse(String(reader.result || '{}'));
                await CORE().importLibrary(payload);
                setStatus('saved library imported');
                state.activeTab = 'saved';
                render();
            } catch (error) {
                setStatus(error.message, true);
            }
        };
        reader.onerror = () => setStatus('import failed', true);
        reader.readAsText(file);
    }

    function table(headers, rows) {
        if (!rows.length) return h('div', { class: 'empty' }, 'nothing captured');
        return h('div', { class: 'tablewrap' },
            h('table', null,
                h('thead', null, h('tr', null, headers.map((header) => h('th', { text: header })))),
                h('tbody', null, rows.map((row) => h('tr', { 'data-filter-row': '1' }, row.map((cell) => h('td', null, cell)))))));
    }

    function link(url) {
        if (!url) return '';
        return h('a', { class: 'url', href: url, target: '_blank', rel: 'noopener', title: url, text: url.replace(/^https?:\/\//, '') });
    }

    async function saveCurrent() {
        if (!state.intel) return;
        try {
            const metadata = await openOrganizationModal({
                title: 'Save scan',
                subtitle: state.intel.title || '(untitled)',
                initial: {},
            });
            if (!metadata) return;
            await CORE().saveSnapshot(state.intel, metadata);
            setStatus('saved locally');
            if (state.activeTab === 'saved') render();
        } catch (error) {
            setStatus(error.message, true);
        }
    }

    function jsonText() {
        return state.intel ? JSON.stringify(state.intel, null, 2) : '';
    }

    function sourcesCsvText() {
        return state.intel ? CORE().toCsv(state.intel.sources) : '';
    }

    async function copyText(text, success) {
        try {
            await navigator.clipboard.writeText(text);
            setStatus(success);
        } catch (error) {
            setStatus('copy failed', true);
        }
    }

    function copyJson() {
        if (!state.intel) return;
        copyText(jsonText(), 'JSON copied');
    }

    function copySourcesCsv() {
        if (!state.intel) return;
        copyText(sourcesCsvText(), 'Sources CSV copied');
    }

    function exportJson() {
        if (!state.intel) return;
        download(`${state.intel.id}.json`, jsonText(), 'application/json');
    }

    function exportSourcesCsv() {
        if (!state.intel) return;
        download(`${state.intel.id}-sources.csv`, sourcesCsvText(), 'text/csv');
    }

    function exportProductsCsv() {
        if (!state.intel) return;
        const rows = state.intel.products.map((product) => {
            const sentiment = sourcedSentimentCounts(product.sidebarInsight);
            const reviewSources = reviewSourcesForInsight(product.sidebarInsight);
            return {
                title: product.title,
                price: product.price,
                tag: product.tag,
                merchants: product.merchants,
                rating: product.rating,
                reviews: product.reviews,
                query: product.query,
                providerUrl: product.providerUrl,
                googleCatalogId: product.googleCatalogId,
                googleProductId: product.googleProductId,
                googleGpcid: product.googleGpcid,
                googleHeadlineOfferDocid: product.googleHeadlineOfferDocid,
                googleImageDocid: product.googleImageDocid,
                googleMerchantId: product.googleMerchantId,
                googleRds: product.googleRds,
                googlePvt: product.googlePvt,
                googleEi: product.googleEi,
                googleQuery: product.googleQuery,
                googleGl: product.googleGl,
                googleHl: product.googleHl,
                googleUule: product.googleUule,
                googleLocaleSource: product.googleLocaleSource || 'missing',
                googleShoppingCandidateUrl: product.googleShoppingCandidateUrl,
                googleShoppingUrlWithMarket: marketShoppingUrl(product.googleShoppingCandidateUrl || ''),
                offers: (product.offers || []).length,
                rationale: product.sidebarInsight && product.sidebarInsight.rationale || '',
                reviewSummary: product.sidebarInsight && product.sidebarInsight.reviewSummary || '',
                sentimentPositive: sentiment.positive,
                sentimentNeutral: sentiment.neutral,
                sentimentNegative: sentiment.negative,
                sidebarSourceCount: reviewSources.length,
            };
        });
        download(`${state.intel.id}-products.csv`, CORE().toCsv(rows), 'text/csv');
    }

    function serializeSvg(svg) {
        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        return new XMLSerializer().serializeToString(clone);
    }

    function closeExportMenu(event) {
        const menu = event && event.currentTarget && event.currentTarget.closest('details');
        if (menu) menu.open = false;
    }

    function exportMenuFromEvent(event) {
        const path = event && typeof event.composedPath === 'function' ? event.composedPath() : [];
        return path.find((node) => node && node.classList && node.classList.contains('exportmenu')) || null;
    }

    function closeExportMenus(except) {
        if (!state.shadow) return;
        state.shadow.querySelectorAll('details.exportmenu[open]').forEach((menu) => {
            if (menu !== except) menu.open = false;
        });
    }

    async function copyFlowSvg(svg) {
        try {
            await navigator.clipboard.writeText(serializeSvg(svg));
            setStatus('SVG copied');
        } catch (error) {
            setStatus('SVG copy failed', true);
        }
    }

    function flowPngBlob(svg) {
        return new Promise((resolve, reject) => {
            const svgText = serializeSvg(svg);
            const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = Number(svg.getAttribute('width')) * 2;
                    canvas.height = Number(svg.getAttribute('height')) * 2;
                    const ctx = canvas.getContext('2d');
                    ctx.scale(2, 2);
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    canvas.toBlob((png) => {
                        if (png) resolve(png);
                        else reject(new Error('PNG render failed'));
                    }, 'image/png');
                } catch (error) {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('PNG render failed'));
            };
            img.src = url;
        });
    }

    async function copyFlowPng(svg) {
        try {
            if (!navigator.clipboard || typeof ClipboardItem === 'undefined') throw new Error('PNG clipboard is unavailable');
            const png = await flowPngBlob(svg);
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
            setStatus('PNG copied');
        } catch (error) {
            setStatus('PNG copy unavailable, saved instead');
            saveFlowPng(svg);
        }
    }

    async function saveFlowPng(svg) {
        const svgText = serializeSvg(svg);
        try {
            const png = await flowPngBlob(svg);
            downloadBlob(`${state.intel.id}-flow.png`, png);
        } catch (error) {
            download(`${state.intel.id}-flow.svg`, svgText, 'image/svg+xml');
        }
    }

    function download(name, text, type) {
        downloadBlob(name, new Blob([text], { type }));
    }

    function downloadBlob(name, blob) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }

    window.CgptGeoResearchUI = { open, close, rescan };
})();