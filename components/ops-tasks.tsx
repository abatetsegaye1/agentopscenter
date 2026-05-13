import { OpsTaskRecord } from "@agentops/contracts";

export function OpsTasks({ tasks }: { tasks: OpsTaskRecord[] }): JSX.Element {
  return (
    <section className="card">
      <h2>Ops Task Queue</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Source</th>
            <th>Priority</th>
            <th>Profile</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.slice(0, 10).map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.source}</td>
              <td>{task.priority}</td>
              <td>{task.agentProfile}</td>
              <td>{task.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
