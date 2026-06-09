export type Status = "Healthy" | "Warning" | "Offline" | "Running" | "Connected" | "Blocked";

export const targets = [
  {
    id: "acme",
    name: "Acme Azure GPU Server",
    type: "Azure VM",
    region: "UAE North",
    agent: "Online",
    stack: "Private AI Basic",
    gpu: "NVIDIA L40S",
    health: "Healthy",
    lastHeartbeat: "8 seconds ago",
    agentVersion: "v0.1.0"
  },
  {
    id: "claims",
    name: "Claims On-Prem Node",
    type: "On-prem GPU Server",
    region: "Dubai Office",
    agent: "Online",
    stack: "Claims AI Stack",
    gpu: "RTX 4090",
    health: "Warning",
    lastHeartbeat: "12 seconds ago",
    agentVersion: "v0.1.0"
  },
  {
    id: "aws",
    name: "AWS Private AI Node",
    type: "AWS EC2",
    region: "eu-west-1",
    agent: "Online",
    stack: "RAG Stack",
    gpu: "A10G",
    health: "Healthy",
    lastHeartbeat: "18 seconds ago",
    agentVersion: "v0.1.0"
  },
  {
    id: "legal",
    name: "Legal Sandbox",
    type: "Local Workstation",
    region: "Legal Department",
    agent: "Offline",
    stack: "None",
    gpu: "Not detected",
    health: "Offline",
    lastHeartbeat: "42 minutes ago",
    agentVersion: "v0.0.9"
  }
];

export const models = [
  { name: "Qwen 32B", hosting: "Local", provider: "Ollama/vLLM", status: "Running", target: "Acme Azure GPU Server", requests: "38,120", latency: "940 ms", access: "Claims, Legal" },
  { name: "Llama 3.1 8B", hosting: "Local", provider: "Ollama", status: "Running", target: "AWS Private AI Node", requests: "22,850", latency: "620 ms", access: "Customer Support" },
  { name: "DeepSeek Coder", hosting: "Local", provider: "vLLM", status: "Running", target: "Engineering GPU Node", requests: "14,900", latency: "780 ms", access: "Engineering" },
  { name: "GPT-5", hosting: "External", provider: "OpenAI", status: "Connected", target: "External Provider", requests: "31,700", latency: "1,120 ms", access: "Engineering, Strategy" },
  { name: "Claude", hosting: "External", provider: "Anthropic", status: "Connected", target: "External Provider", requests: "16,300", latency: "1,040 ms", access: "Legal" },
  { name: "Gemini", hosting: "External", provider: "Google", status: "Connected", target: "External Provider", requests: "4,550", latency: "980 ms", access: "Marketing" }
];

export const workspaces = [
  {
    name: "Legal AI Assistant",
    department: "Legal",
    interface: "Open WebUI",
    launchUrl: "https://legal-ai.controlplane.example.com",
    publishStatus: "Published",
    assignedUsers: "Legal team",
    allowedModels: ["Claude", "Qwen 32B"],
    knowledgeBases: ["Legal Contracts"],
    agents: ["Contract Review Agent"],
    routingPolicy: "Legal confidential review",
    tokenBudget: "2M tokens / month",
    externalRule: "Restricted for confidential matters",
    audit: "Enabled",
    status: "Governance risk"
  },
  {
    name: "Claims AI Assistant",
    department: "Claims",
    interface: "Open WebUI",
    launchUrl: "https://claims-ai.controlplane.example.com",
    publishStatus: "Published",
    assignedUsers: "Claims department",
    allowedModels: ["Qwen 32B", "Llama 3.1 8B"],
    knowledgeBases: ["Claims SOPs", "Policy Documents"],
    agents: ["Claims Summary Agent"],
    routingPolicy: "Claims sensitive workflow",
    tokenBudget: "4M tokens / month",
    externalRule: "Blocked",
    audit: "Enabled",
    status: "Healthy"
  },
  {
    name: "Engineering Copilot",
    department: "Engineering",
    interface: "Open WebUI / custom chat",
    launchUrl: "https://engineering-ai.controlplane.example.com",
    publishStatus: "Published",
    assignedUsers: "Engineering team",
    allowedModels: ["GPT-5", "Claude", "DeepSeek Coder"],
    knowledgeBases: ["Engineering Docs", "Codebase Docs"],
    agents: ["Code Review Agent"],
    routingPolicy: "Engineering code assist",
    tokenBudget: "6M tokens / month",
    externalRule: "Allowed",
    audit: "Enabled",
    status: "Healthy"
  },
  {
    name: "Finance AI Desk",
    department: "Finance",
    interface: "Custom chat",
    launchUrl: "https://finance-ai.controlplane.example.com",
    publishStatus: "Draft",
    assignedUsers: "Finance team",
    allowedModels: ["Qwen 32B", "Claude"],
    knowledgeBases: ["Finance Policies"],
    agents: ["Finance Analysis Agent"],
    routingPolicy: "Finance local-first",
    tokenBudget: "900K tokens / month",
    externalRule: "Approval required",
    audit: "Enabled",
    status: "Healthy"
  }
];

export const providerHealth = [
  {
    provider: "OpenAI",
    status: "Degraded",
    affectedModels: ["GPT-5"],
    lastChecked: "48 seconds ago",
    source: "Provider status feed",
    impact: "Elevated latency on GPT-5 requests",
    action: "Route critical work to Claude or Qwen 32B"
  },
  {
    provider: "Anthropic",
    status: "Operational",
    affectedModels: ["Claude"],
    lastChecked: "54 seconds ago",
    source: "Provider status feed",
    impact: "No active provider incident",
    action: "Keep normal routing"
  },
  {
    provider: "Google",
    status: "Operational",
    affectedModels: ["Gemini"],
    lastChecked: "1 minute ago",
    source: "Provider status feed",
    impact: "No active provider incident",
    action: "Keep normal routing"
  },
  {
    provider: "Ollama/vLLM",
    status: "Self-hosted",
    affectedModels: ["Qwen 32B", "Llama 3.1 8B", "DeepSeek Coder"],
    lastChecked: "Live agent telemetry",
    source: "Server health",
    impact: "Controlled by local targets",
    action: "Use server details for runtime health"
  }
];

export const departments = ["Engineering", "Legal", "Claims", "Finance", "Customer Support", "Marketing"];
export const permissionModels = ["Qwen 32B", "Llama 3.1 8B", "GPT-5", "Claude"];

export const initialPermissions: Record<string, Record<string, boolean>> = {
  Engineering: { "Qwen 32B": true, "Llama 3.1 8B": true, "GPT-5": true, Claude: true },
  Legal: { "Qwen 32B": true, "Llama 3.1 8B": false, "GPT-5": false, Claude: true },
  Claims: { "Qwen 32B": true, "Llama 3.1 8B": true, "GPT-5": false, Claude: false },
  Finance: { "Qwen 32B": true, "Llama 3.1 8B": false, "GPT-5": false, Claude: false },
  "Customer Support": { "Qwen 32B": false, "Llama 3.1 8B": true, "GPT-5": false, Claude: false },
  Marketing: { "Qwen 32B": false, "Llama 3.1 8B": false, "GPT-5": true, Claude: false }
};

export const initialDepartmentTokenBudgets: Record<string, { monthlyLimit: number; used: number; hardLimit: boolean }> = {
  Engineering: { monthlyLimit: 18000000, used: 11200000, hardLimit: true },
  Legal: { monthlyLimit: 6000000, used: 3100000, hardLimit: true },
  Claims: { monthlyLimit: 12000000, used: 8700000, hardLimit: true },
  Finance: { monthlyLimit: 3500000, used: 1400000, hardLimit: true },
  "Customer Support": { monthlyLimit: 9000000, used: 5200000, hardLimit: false },
  Marketing: { monthlyLimit: 2500000, used: 980000, hardLimit: false }
};

export const initialUserTokenBudgets = [
  { id: "u1", name: "Maya Rao", email: "maya@acme.ai", department: "Engineering", monthlyLimit: 2500000, used: 1620000, status: "Active" },
  { id: "u2", name: "Omar Khan", email: "omar@acme.ai", department: "Engineering", monthlyLimit: 1800000, used: 790000, status: "Active" },
  { id: "u3", name: "Leena Shah", email: "leena@acme.ai", department: "Legal", monthlyLimit: 900000, used: 640000, status: "Active" },
  { id: "u4", name: "Farah Ali", email: "farah@acme.ai", department: "Claims", monthlyLimit: 1400000, used: 1180000, status: "Near limit" },
  { id: "u5", name: "Daniel Cruz", email: "daniel@acme.ai", department: "Finance", monthlyLimit: 650000, used: 210000, status: "Active" },
  { id: "u6", name: "Nadia Basu", email: "nadia@acme.ai", department: "Customer Support", monthlyLimit: 1200000, used: 880000, status: "Active" },
  { id: "u7", name: "Yusuf Malik", email: "yusuf@acme.ai", department: "Marketing", monthlyLimit: 500000, used: 420000, status: "Near limit" }
];

export const initialOperationalThresholds = {
  gpuMemoryWarning: 90,
  gpuMemoryCritical: 96,
  cpuWarning: 85,
  ramWarning: 88,
  diskWarning: 82,
  latencyWarning: 1200,
  monthlyCostWarning: 20000
};

export const services = [
  { name: "Ollama", status: "Running", port: "11434" },
  { name: "LiteLLM", status: "Running", port: "4000" },
  { name: "Open WebUI", status: "Running", port: "3000" },
  { name: "Qdrant", status: "Running", port: "6333" },
  { name: "Postgres", status: "Running", port: "5432" },
  { name: "Monitoring Exporter", status: "Running", port: "9100" }
];

export const timeline = [
  "Checking Docker",
  "Pulling images",
  "Creating network",
  "Starting Postgres",
  "Starting Qdrant",
  "Starting Ollama",
  "Starting LiteLLM",
  "Starting Open WebUI",
  "Verifying services",
  "Deployment complete"
];

export const stacks = [
  { name: "Private AI Basic", includes: ["Ollama", "LiteLLM", "Open WebUI", "Qdrant", "Postgres"], useCase: "Basic private AI deployment", infra: "1 GPU server, 48 GB VRAM, 128 GB RAM" },
  { name: "Private RAG Stack", includes: ["vLLM", "LiteLLM", "Qdrant", "Document processor", "Langfuse"], useCase: "Internal knowledge assistant", infra: "2 GPU nodes, object storage, vector database" },
  { name: "Claims AI Stack", includes: ["vLLM", "Policy RAG", "Claim summarizer", "Audit logging"], useCase: "Regulated document workflow", infra: "On-prem GPU node, private document store" },
  { name: "Developer AI Stack", includes: ["Code model", "LiteLLM", "Open WebUI", "Usage logging"], useCase: "Engineering teams", infra: "A10G or L40S GPU node" }
];

export const alerts = [
  { title: "OpenAI provider degradation affecting GPT-5", severity: "Warning", area: "Provider" },
  { title: "Claims On-Prem Node GPU memory above configured threshold", severity: "Warning", area: "Infrastructure" },
  { title: "Legal Sandbox agent offline", severity: "Critical", area: "Agent" },
  { title: "GPT-5 monthly cost above threshold", severity: "Warning", area: "Cost" },
  { title: "LiteLLM restart event detected", severity: "Info", area: "Service" }
];

export const auditLogs = [
  { timestamp: "2026-06-09 09:44", actor: "agent/acme", action: "Agent registered for Acme Azure GPU Server", target: "Acme Azure GPU Server", severity: "Info", status: "Success", type: "Agent" },
  { timestamp: "2026-06-09 09:48", actor: "admin@acme.ai", action: "Private AI Basic stack deployed", target: "Acme Azure GPU Server", severity: "Info", status: "Success", type: "Deployment" },
  { timestamp: "2026-06-09 10:02", actor: "ops@acme.ai", action: "LiteLLM service restarted", target: "LiteLLM", severity: "Info", status: "Success", type: "Deployment" },
  { timestamp: "2026-06-09 10:08", actor: "security@acme.ai", action: "Legal model access changed", target: "Legal", severity: "Medium", status: "Success", type: "Permission" },
  { timestamp: "2026-06-09 10:13", actor: "policy-engine", action: "GPT-5 access blocked for Claims department", target: "Claims", severity: "Medium", status: "Enforced", type: "Permission" },
  { timestamp: "2026-06-09 10:18", actor: "admin@acme.ai", action: "Qwen 32B model endpoint added", target: "Qwen 32B", severity: "Info", status: "Success", type: "Model" },
  { timestamp: "2026-06-09 10:26", actor: "monitoring", action: "Budget alert triggered", target: "GPT-5", severity: "High", status: "Open", type: "Alert" },
  { timestamp: "2026-06-09 10:31", actor: "ops@acme.ai", action: "User viewed service logs", target: "Open WebUI", severity: "Info", status: "Success", type: "Agent" },
  { timestamp: "2026-06-09 10:42", actor: "admin@acme.ai", action: "Rollback completed", target: "Claims AI Stack", severity: "Medium", status: "Success", type: "Deployment" }
];

export const requestVolume = [
  { name: "Mon", requests: 12800, latency: 780, cost: 2100, gpu: 51, errors: 0.8 },
  { name: "Tue", requests: 16400, latency: 812, cost: 2600, gpu: 63, errors: 1.1 },
  { name: "Wed", requests: 19800, latency: 790, cost: 3100, gpu: 68, errors: 0.7 },
  { name: "Thu", requests: 22400, latency: 840, cost: 3400, gpu: 74, errors: 1.4 },
  { name: "Fri", requests: 27100, latency: 860, cost: 3900, gpu: 71, errors: 0.9 },
  { name: "Sat", requests: 18300, latency: 805, cost: 2500, gpu: 55, errors: 0.5 },
  { name: "Sun", requests: 11620, latency: 760, cost: 1800, gpu: 44, errors: 0.4 }
];

export const costByModel = [
  { name: "GPT-5", value: 7200 },
  { name: "Qwen 32B", value: 3900 },
  { name: "Claude", value: 3100 },
  { name: "Llama 3.1", value: 2100 },
  { name: "Gemini", value: 1200 }
];

export const requestsByDepartment = [
  { name: "Engineering", value: 38 },
  { name: "Claims", value: 24 },
  { name: "Legal", value: 16 },
  { name: "Support", value: 14 },
  { name: "Marketing", value: 8 }
];

export const cpuRamSeries = [
  { name: "09:00", cpu: 21, ram: 52, gpu: 66, latency: 760 },
  { name: "09:10", cpu: 24, ram: 55, gpu: 71, latency: 790 },
  { name: "09:20", cpu: 28, ram: 57, gpu: 75, latency: 820 },
  { name: "09:30", cpu: 23, ram: 58, gpu: 72, latency: 812 },
  { name: "09:40", cpu: 24, ram: 58, gpu: 71, latency: 801 },
  { name: "09:50", cpu: 26, ram: 59, gpu: 74, latency: 830 }
];

export const deploymentEvents = [
  "Private AI Basic deployed to Acme Azure GPU Server",
  "OpenAI provider status degraded for GPT-5 routing",
  "Claims AI Stack health degraded on Claims On-Prem Node",
  "Qwen 32B endpoint added to model catalog",
  "Legal Sandbox agent missed heartbeat",
  "Open WebUI service restarted on Acme Azure GPU Server"
];
