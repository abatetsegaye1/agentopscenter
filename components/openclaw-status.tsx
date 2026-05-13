import { OpenClawConnectorStatus, OpenClawGatewayStatus, OpenClawProcessStatus } from "@agentops/contracts";

export function OpenClawStatus({
  status,
  connector,
  processStatuses
}: {
  status: OpenClawGatewayStatus;
  connector: OpenClawConnectorStatus;
  processStatuses: OpenClawProcessStatus[];
}): JSX.Element {
  return (
    <section className="card">
      <div className="section-title">
        <h2>OpenClaw Gateway</h2>
        <span className={status.connected ? "pill-ok" : "pill-bad"}>
          {status.connected ? "connected" : "disconnected"}
        </span>
      </div>
      <p className="hint">{status.url}</p>
      <p className="hint">Version: {status.version}</p>
      <p className="hint">Queue depth: {status.queueDepth}</p>
      <p className="hint">Last heartbeat: {new Date(status.lastHeartbeatAt).toLocaleString()}</p>
      <h3>Connector</h3>
      <p className="hint">Enabled: {connector.enabled ? "yes" : "no"}</p>
      <p className="hint">Connected: {connector.connected ? "yes" : "no"}</p>
      <p className="hint">Reconnect attempts: {connector.reconnectAttempts}</p>
      <p className="hint">Last error: {connector.lastError ?? "-"}</p>
      <h3>Process Health</h3>
      <ul className="simple-list">
        {processStatuses.map((processStatus) => (
          <li key={processStatus.processRole}>
            {processStatus.processRole} | connector={processStatus.connector.connected ? "connected" : "disconnected"} | gateway={processStatus.gateway.connected ? "connected" : "disconnected"} | updated={new Date(processStatus.updatedAt).toLocaleString()}
          </li>
        ))}
      </ul>
      <h3>Channels</h3>
      <ul className="simple-list">
        {status.channels.map((channel) => (
          <li key={channel.name}>
            {channel.name} | {channel.connected ? "connected" : "offline"} | {channel.health}
          </li>
        ))}
      </ul>
      <h3>Nodes</h3>
      <ul className="simple-list">
        {status.nodes.map((node) => (
          <li key={node.nodeId}>
            {node.nodeId} | {node.connected ? "connected" : "offline"} | {node.capabilities.join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
