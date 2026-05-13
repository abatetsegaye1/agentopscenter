import { DomainOpportunityRecord } from "@agentops/contracts";

interface OpportunitiesBoardProps {
  opportunities: DomainOpportunityRecord[];
}

export function OpportunitiesBoard({ opportunities }: OpportunitiesBoardProps): JSX.Element {
  return (
    <section className="card">
      <div className="section-title">
        <h2>Domain Opportunities</h2>
        <span className="hint">{opportunities.length} record(s)</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Title</th>
            <th>Scores</th>
            <th>Domains</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((item) => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.title}</td>
              <td>
                C:{item.confidenceScore.toFixed(2)} U:{item.urgencyScore.toFixed(2)} S:
                {item.strategicValueScore.toFixed(2)}
              </td>
              <td className="marketing-output" title={item.candidateDomains.join(", ")}>
                {item.candidateDomains.join(", ") || "-"}
              </td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
