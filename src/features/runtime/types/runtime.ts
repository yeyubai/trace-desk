export type RuntimeServiceStatus = "mock" | "configured" | "missing";

export type RuntimeDependency = {
  id: string;
  label: string;
  detail: string;
  status: RuntimeServiceStatus;
};

export type RuntimeOverview = {
  dataMode: "mock" | "live";
  aiMode: "mock" | "bailian";
  dependencies: RuntimeDependency[];
};
