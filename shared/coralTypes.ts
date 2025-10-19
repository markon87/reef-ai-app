export interface Coral {
  id: string;
  name: string;
  lighting: "low" | "medium" | "high";
  flow: "low" | "medium" | "high";
  compatibleWith: string[];
}