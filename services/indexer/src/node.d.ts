declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}

declare namespace NodeJS {
  interface Timeout {}
}

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): any;
};
