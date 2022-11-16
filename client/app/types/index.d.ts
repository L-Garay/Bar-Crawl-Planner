export {};

declare global {
  interface Window {
    ENV: Record<string, Record<string, string>>;
  }
}
