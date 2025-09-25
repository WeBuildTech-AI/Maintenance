export const mockMeters = [
  {
    id: "M-001",
    name: "Electrical",
    type: "HVAC",
    asset: "HVAC Unit 1",
    location: "General",
    lastReading: "50 Feet",
    status: "Overdue",
    isOverdue: true,
    unit: "Feet",
  },
  {
    id: "M-002",
    name: "Water Flow",
    type: "Plumbing",
    asset: "Main Pipe",
    location: "Building A",
    lastReading: "120 Liters",
    status: "Normal",
    isOverdue: false,
    unit: "Liters",
  },
  // ... your other mock data
];

export const mockReadingData = [
  { date: "13 Sep", value: 20 },
  { date: "14 Sep", value: 20 },
  { date: "15 Sep", value: 20 },
  { date: "16 Sep", value: 20 },
  { date: "17 Sep", value: 20 },
  { date: "18 Sep", value: 22 },
  { date: "19 Sep", value: 50 }
];
