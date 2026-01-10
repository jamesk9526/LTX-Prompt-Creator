import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1>LTX Prompter · Electron/Next</h1>
        <p>Start the walkthrough experience or jump to the legacy wizard port.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="button primary" href="/wizard">Open walkthrough</Link>
          <Link className="button" href="/legacy">Legacy form (placeholder)</Link>
        </div>
      </div>
    </main>
  );
}
