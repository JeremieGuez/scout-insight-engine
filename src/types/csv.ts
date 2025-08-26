// Dynamic CSV row type that accepts any string keys
export interface FBrefPlayerRow {
  [key: string]: string; // This allows any column name
}
