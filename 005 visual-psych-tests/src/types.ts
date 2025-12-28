export type TestId = "plane" | "moving" | "drag";

export type Point = {
  x: number;
  y: number;
  t: number;
};

export type Action = {
  type: string;
  t: number;
  x?: number;
  y?: number;
  note?: string;
};

export type TestResult = {
  id: TestId;
  completedAt: number;
  metrics: Record<string, number>;
  raw: {
    points: Point[];
    actions: Action[];
    meta?: Record<string, unknown>;
  };
};

export type StoredResults = Partial<Record<TestId, TestResult>>;
