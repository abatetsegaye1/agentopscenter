import { MarketingAgentRunRecord } from "@agentops/contracts";

interface AgentRunsBoardProps {
  runs: MarketingAgentRunRecord[];
}

export function AgentRunsBoard({ runs }: AgentRunsBoardProps): JSX.Element {
  return (
    <section className="card">
      <div className="section-title">
        <h2>Agent Runs</h2>
        <span className="hint">{runs.length} recent run(s)</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Layer</th>
            <th>Status</th>
            <th>Action</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td>{run.agentName}</td>
              <td>{run.layer}</td>
              <td>{run.status}</td>
              <td className="marketing-output" title={run.action}>
                {run.action}
              </td>
              <td>{new Date(run.startedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
