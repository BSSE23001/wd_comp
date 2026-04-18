export type PlatformOption = "Uber" | "Foodpanda" | "Careem" | "Bykea" | "InDrive";
export type TabMode = "manual" | "bulk";

export interface ManualFormData {
  platform: PlatformOption | "";
  date: string;
  hoursWorked: string;
  grossEarned: string;
  platformDeductions: string;
}

export interface CSVRow {
  platform: PlatformOption;
  date: string;
  hoursWorked: number;
  grossEarned: number;
  platformDeductions: number;
  netReceived: number;
}

export interface SuccessToastProps {
  visible: boolean;
  onDismiss: () => void;
  onUploadClick: () => void;
}

export interface ShiftLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

