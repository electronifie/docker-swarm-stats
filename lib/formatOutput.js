class FormatOutput {
  formatNodes(nodes) {
    return nodes.map((e) => {
      return `Hostname: ${e.hostname}\tRole: ${e.role}\tLabels: ` + 
        Object.keys(e.labels).map((k) => `${k}=${e.labels[k]}`).join(", ")
    }).join("\n");
  }

  formatServices(services) {
    return services.map((e) => {
      return `Service: ${e.name}\t\tReplicas: ${e.replicas}\tID: ${e.id}`;
    }).join("\n");
  }
};

module.exports = new FormatOutput;

