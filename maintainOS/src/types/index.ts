// Re-export all Prisma types for easy importing
export type {
  User,
  UserRole,
  UserVisibility,
  RateVisibility,
  Organization,
  IndustryType,
  Asset,
  AssetStatus,
  AssetCriticality,
  WorkOrder,
  WorkOrderPriority,
  PurchaseOrder,
  PurchaseOrderStatus,
  Vendor,
  Location,
  Category,
  Part,
  Meter,
  MeterType,
  Procedure,
  ProcedureType,
  ProcedureFrequency,
  AuditLog,
  Attachment,
  TeamMember,
  Team,
  Automation,
  WorkOrderComment,
  // Include Prisma utility types
  Prisma,
} from "@prisma/client";

// API-safe versions (excluding sensitive fields)
export type {
  UserResponse,
  CreateUserData,
  UpdateUserData,
} from "../services/userService";
