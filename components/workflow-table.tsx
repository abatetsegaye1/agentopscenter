import { WorkflowSummary } from "@agentops/contracts";

export function WorkflowTable({ rows }: { rows: WorkflowSummary[] }): JSX.Element {
  return (
    <section className="card">
      <h2>Workflow Performance</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Total Runs</th>
            <th>Failed Runs</th>
            <th>Success Rate</th>
            <th>Avg Latency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.workflow}>
              <td>{row.workflow}</td>
              <td>{row.totalRuns}</td>
              <td>{row.failedRuns}</td>
              <td>{row.successRatePct}%</td>
              <td>{row.avgLatencyMs} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
