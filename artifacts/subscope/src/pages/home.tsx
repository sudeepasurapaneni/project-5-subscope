import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, Check, ChevronDown, CircleHelp, FileJson2,
  FileUp, Fingerprint, LockKeyhole, Search, ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react';
import { filterFindings, MAX_INPUT_BYTES, MAX_TEXT_LENGTH, parseImport, validateDomain, type Finding } from '@/lib/analyzer';

type ImportMode = 'paste' | 'file';

function downloadCsv(rows: Finding[], domain: string) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [
    ['Target domain', domain],
    [],
    ['Hostname', 'DNS status', 'Source'],
    ...rows.map((row) => [row.hostname, row.dnsStatus, row.source]),
  ].map((line) => line.map(escape).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${domain}-subscope.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [domainInput, setDomainInput] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [mode, setMode] = useState<ImportMode>('paste');
  const [result, setResult] = useState<{ domain: string; findings: Finding[] } | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleFindings = useMemo(() => {
    if (!result) return [];
    const query = search.trim().toLowerCase();
    return result.findings.filter((finding) => finding.hostname.includes(query));
  }, [result, search]);

  const runAnalysis = () => {
    try {
      const domain = validateDomain(domainInput);
      const names = parseImport(
        sourceText,
        mode === 'paste' ? MAX_TEXT_LENGTH : MAX_INPUT_BYTES,
      );
      setResult({ domain, findings: filterFindings(names, domain) });
      setSearch('');
      setError('');
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Unable to process this input.');
    }
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setResult(null);
    if (file.size > MAX_INPUT_BYTES) {
      setError('This file is over the 2 MB limit. Choose a smaller file.');
      event.currentTarget.value = '';
      return;
    }
    try {
      const text = await file.text();
      setSourceText(text);
      setFileName(file.name);
      setError('');
      setMode('file');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read this file.');
    }
  };

  const clearAll = () => {
    setDomainInput('');
    setSourceText('');
    setFileName('');
    setResult(null);
    setSearch('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onTextChange = (value: string) => {
    setSourceText(value);
    setResult(null);
    setFileName('');
    setError('');
    if (value.length > MAX_TEXT_LENGTH) setError('Pasted text is over the 1 MB limit. Remove some records.');
  };

  return (
    <div className="app-shell">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-200">
            <Fingerprint size={20} strokeWidth={1.8} />
          </div>
          <div className="leading-tight">
            <div className="display-font text-[17px] font-extrabold tracking-[-.04em] text-slate-100">SubScope</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.19em] text-slate-500">CT data analyzer</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-2 text-[11px] font-semibold tracking-wide text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          LOCAL ONLY
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-14 sm:px-8 lg:px-12">
        <section className="soft-grid relative overflow-hidden rounded-[28px] border border-slate-700/45 bg-[#0e1b2a]/75 px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border border-cyan-200/[.06]" />
          <div className="pointer-events-none absolute -right-2 -top-16 h-56 w-56 rounded-full border border-cyan-200/[.07]" />
          <div className="enter relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.15em] text-cyan-100/80">
              <Sparkles size={13} /> Learn from the records you bring
            </div>
            <h1 className="display-font max-w-[740px] text-[40px] font-bold leading-[1.04] tracking-[-.055em] text-slate-50 sm:text-[54px] lg:text-[62px]">
              See how certificate names <span className="text-cyan-200">relate to your domain.</span>
            </h1>
            <p className="mt-5 max-w-[650px] text-[15px] leading-7 text-slate-400 sm:text-base">
              Import Certificate Transparency records from an authorized assessment. SubScope filters them on this device—nothing is discovered or looked up for you.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-400">
              <span className="flex items-center gap-2"><LockKeyhole size={14} className="text-cyan-200/80" /> No uploads. No network requests.</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-200/80" /> DNS is never queried.</span>
            </div>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          <section className="panel enter rounded-2xl p-5 sm:p-6" aria-labelledby="import-title">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200/75">
                  <span className="mono-font">01</span><span className="h-px w-7 bg-cyan-200/30" /> Import records
                </div>
                <h2 id="import-title" className="display-font text-xl font-bold tracking-[-.035em] text-slate-100">Set your scope</h2>
              </div>
              <div className="rounded-xl bg-slate-800/70 p-2.5 text-slate-400"><FileJson2 size={18} /></div>
            </div>

            <label htmlFor="target-domain" className="mb-2 block text-xs font-semibold text-slate-300">Target domain</label>
            <div className="relative">
              <input
                id="target-domain" data-testid="input-target-domain"
                value={domainInput} onChange={(event) => { setDomainInput(event.target.value); setResult(null); }}
                placeholder="example.org" autoComplete="off" spellCheck={false}
                className="focus-ring h-11 w-full rounded-lg border border-slate-700 bg-[#0a1522] px-3.5 pr-10 font-mono text-sm text-slate-100 placeholder:text-slate-600"
              />
              <CircleHelp size={16} className="absolute right-3.5 top-3.5 text-slate-500" aria-hidden="true" />
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500" data-testid="text-domain-guidance">Hostname domain only—not a URL or IP address.</p>

            <div className="mb-3 mt-6 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Your CT data</label>
              <div className="flex rounded-lg border border-slate-700/80 bg-[#0b1623] p-1" role="tablist" aria-label="Import method">
                <button data-testid="tab-paste" type="button" onClick={() => setMode('paste')} className={`focus-ring rounded-md px-3 py-1.5 text-[11px] font-semibold interactive ${mode === 'paste' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`} role="tab" aria-selected={mode === 'paste'}>Paste</button>
                <button data-testid="tab-file" type="button" onClick={() => setMode('file')} className={`focus-ring rounded-md px-3 py-1.5 text-[11px] font-semibold interactive ${mode === 'file' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`} role="tab" aria-selected={mode === 'file'}>File</button>
              </div>
            </div>

            {mode === 'paste' ? (
              <textarea
                data-testid="textarea-ct-records"
                value={sourceText}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder={'Paste JSON records or one hostname per line…\n\nExample:\nportal.example.org\nstatus.example.org'}
                className="focus-ring scrollbar-thin min-h-[190px] w-full resize-y rounded-lg border border-slate-700 bg-[#0a1522] px-3.5 py-3 font-mono text-xs leading-6 text-slate-200 placeholder:text-slate-600"
                spellCheck={false} aria-label="Paste Certificate Transparency records"
              />
            ) : (
              <button data-testid="button-choose-file" type="button" onClick={() => fileRef.current?.click()} className="focus-ring interactive flex min-h-[190px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#0a1522]/75 px-5 text-center hover:border-cyan-200/45 hover:bg-cyan-200/[.025]">
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-slate-700 bg-slate-800/80 text-cyan-100"><FileUp size={19} /></span>
                <span className="text-sm font-semibold text-slate-200">{fileName || 'Choose a local file'}</span>
                <span className="mt-1.5 text-[11px] text-slate-500">{fileName ? 'Select a different file' : 'JSON or TXT · up to 2 MB'}</span>
              </button>
            )}
            {mode === 'file' && <input ref={fileRef} data-testid="input-file-upload" type="file" accept=".json,.txt,application/json,text/plain" className="hidden" onChange={onFileChange} />}

            <div className="mt-3 flex items-start gap-2 text-[10px] leading-[1.6] text-slate-500">
              <Upload size={13} className="mt-px shrink-0 text-slate-400" />
              <span>Supports crt.sh JSON, records with <code className="mono-font text-slate-400">dns_names</code> / <code className="mono-font text-slate-400">common_name</code>, and plain hostnames. Max 1 MB pasted text.</span>
            </div>
            {error && <div data-testid="status-import-error" role="alert" className="mt-4 flex gap-2.5 rounded-lg border border-rose-300/20 bg-rose-300/[.07] px-3.5 py-3 text-xs leading-5 text-rose-100"><AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-300" /><span>{error}</span></div>}

            <div className="mt-5 flex gap-2.5">
              <button data-testid="button-analyze" type="button" onClick={runAnalysis} className="focus-ring interactive flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-bold text-[#0b1b28] shadow-[0_5px_20px_rgba(89,212,218,.1)] hover:bg-cyan-100">
                <ShieldCheck size={16} /> Analyze locally
              </button>
              <button data-testid="button-clear" type="button" onClick={clearAll} aria-label="Clear input and results" className="focus-ring interactive grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-100"><X size={17} /></button>
            </div>
            <div className="mt-4 border-t border-slate-700/70 pt-4">
              <div className="flex items-start gap-2.5 text-[11px] leading-[1.65] text-slate-400">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-200/80" />
                <p><strong className="font-semibold text-slate-300">Authorized use only.</strong> Import records you are permitted to assess. SubScope never collects records or discovers hosts.</p>
              </div>
            </div>
          </section>

          <section className="panel enter-delay min-h-[450px] overflow-hidden rounded-2xl" aria-labelledby="results-title">
            <div className="flex flex-col gap-5 border-b border-slate-700/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200/75">
                  <span className="mono-font">02</span><span className="h-px w-7 bg-cyan-200/30" /> Results
                </div>
                <h2 id="results-title" className="display-font text-xl font-bold tracking-[-.035em] text-slate-100">Related hostnames</h2>
                {result && <p data-testid="text-result-domain" className="mono-font mt-1.5 text-xs text-slate-400">{result.domain}</p>}
              </div>
              {result && result.findings.length > 0 && (
                <button data-testid="button-export-csv" type="button" onClick={() => downloadCsv(result.findings, result.domain)} className="focus-ring interactive inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-600 bg-slate-800/60 px-3.5 text-xs font-semibold text-slate-200 hover:border-cyan-200/35 hover:text-cyan-100 sm:self-auto">
                  <ArrowDownToLine size={15} /> Export CSV
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-700/70 border-b border-slate-700/70">
              <div className="px-5 py-4 sm:px-7">
                <div className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Discovered in input</div>
                <div data-testid="text-discovered-count" className="display-font mt-1 text-2xl font-bold tracking-tight text-slate-100">{result ? result.findings.length : '—'}</div>
              </div>
              <div className="px-5 py-4 sm:px-7">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Verified <span className="rounded-full border border-slate-600 px-1.5 py-0.5 text-[8px] tracking-normal text-slate-400">DNS</span></div>
                <div data-testid="text-verified-count" className="display-font mt-1 text-2xl font-bold tracking-tight text-slate-400">{result ? '0' : '—'}</div>
              </div>
            </div>

            {!result ? (
              <div data-testid="empty-results" className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="relative mb-5 grid h-[68px] w-[68px] place-items-center rounded-2xl border border-slate-700 bg-[#0c1826] text-slate-500">
                  <Search size={24} strokeWidth={1.5} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#132131] bg-cyan-200/70" />
                </div>
                <h3 className="display-font text-base font-bold text-slate-200">Your findings will appear here</h3>
                <p className="mt-2 max-w-[350px] text-xs leading-5 text-slate-500">Set a target domain, then analyze a local CT export or a list of hostnames. No findings are shown until valid input is processed.</p>
              </div>
            ) : result.findings.length === 0 ? (
              <div data-testid="empty-no-subdomains" className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-5 grid h-[60px] w-[60px] place-items-center rounded-2xl border border-slate-700 bg-[#0c1826] text-slate-500"><Check size={23} /></div>
                <h3 className="display-font text-base font-bold text-slate-200">No subdomains found</h3>
                <p className="mt-2 max-w-[360px] text-xs leading-5 text-slate-500">The import was valid, but none of its names matched <span className="mono-font text-slate-300">{result.domain}</span> or its exact subdomain boundary.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <p data-testid="text-match-summary" className="text-xs text-slate-400"><span className="font-semibold text-slate-200">{result.findings.length}</span> matching {result.findings.length === 1 ? 'hostname' : 'hostnames'} · user-provided data</p>
                  <label className="relative block w-full sm:max-w-[230px]">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input data-testid="input-search-results" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search hostnames" className="focus-ring h-9 w-full rounded-lg border border-slate-700 bg-[#0a1522] pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600" />
                  </label>
                </div>
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead><tr className="border-y border-slate-700/70 bg-[#0c1826]/75 text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">
                      <th className="px-5 py-3 font-semibold sm:px-7">Hostname</th>
                      <th className="px-4 py-3 font-semibold">DNS status</th>
                      <th className="px-4 py-3 font-semibold">Source</th>
                    </tr></thead>
                    <tbody>
                      {visibleFindings.map((finding, index) => (
                        <tr key={finding.hostname} data-testid={`row-finding-${index}`} className="group border-b border-slate-700/45 transition-colors hover:bg-cyan-100/[.025]">
                          <td data-testid={`text-hostname-${index}`} className="mono-font px-5 py-3.5 text-xs text-slate-200 sm:px-7">{finding.hostname}</td>
                          <td className="px-4 py-3.5"><span data-testid={`status-dns-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-amber-100/10 bg-amber-100/[.04] px-2.5 py-1 text-[10px] text-amber-100/75"><span className="h-1 w-1 rounded-full bg-amber-200/70" />{finding.dnsStatus}</span></td>
                          <td data-testid={`text-source-${index}`} className="px-4 py-3.5 text-[11px] text-slate-400">{finding.source}</td>
                        </tr>
                      ))}
                      {visibleFindings.length === 0 && <tr><td colSpan={3} className="px-7 py-12 text-center text-xs text-slate-500">No hostnames match “{search}”.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-start gap-2 border-t border-slate-700/60 px-5 py-4 text-[10px] leading-5 text-slate-500 sm:px-7">
                  <LockKeyhole size={13} className="mt-0.5 shrink-0 text-cyan-200/70" />
                  DNS status is always “Not checked.” Verification would require a separate, explicit workflow; this analyzer makes no DNS queries.
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="mt-7 flex flex-col gap-2 border-t border-slate-700/50 pt-5 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>SubScope <span className="mx-1 text-slate-700">/</span> Educational CT record analysis</span>
          <span className="flex items-center gap-1.5"><LockKeyhole size={11} /> All processing stays in this browser <ChevronDown size={12} className="rotate-[-90deg]" /></span>
        </footer>
      </main>
    </div>
  );
}
