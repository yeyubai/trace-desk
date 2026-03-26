export type RuntimeServiceStatus = "mock" | "configured" | "missing";

export type RuntimeDependency = {
  id: string;
  label: string;
  detail: string;
  status: RuntimeServiceStatus;
};

export type RuntimeSummary = {
  configuredCount: number;
  missingCount: number;
  mockCount: number;
  ready: boolean;
  label: string;
  detail: string;
};

export type RuntimeOverview = {
  dataMode: "mock" | "live";
  aiMode: "mock" | "bailian";
  dependencies: RuntimeDependency[];
  summary: RuntimeSummary;
};
