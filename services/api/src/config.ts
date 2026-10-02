import { z } from "zod";

export const ApiConfigSchema = z.object({
  port: z.number().int().min(0).default(3000),
  host: z.string().default("0.0.0.0"),
  network: z.string().default("testnet"),
  databaseUrl: z.string().min(1, "databaseUrl is required"),
  contractId: z.string().min(1, "contractId is required"),
  rpcUrl: z.string().default("https://soroban-testnet.stellar.org"),
  networkPassphrase: z.string().default("Test SDF Network ; September 2015"),
  enableAnchoring: z.boolean().default(false),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;
export type ApiConfigInput = z.input<typeof ApiConfigSchema>;

export function validateApiConfig(input: ApiConfigInput): ApiConfig {
  return ApiConfigSchema.parse(input);
}

export function detectUnsafeDefaults(config: ApiConfig, isProduction: boolean = false): string[] {
  const warnings: string[] = [];
  if (config.contractId === "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM") {
    warnings.push("Default test placeholder contractId is in use");
  }
  if (isProduction || config.network === "mainnet") {
    if (config.networkPassphrase === "Test SDF Network ; September 2015") {
      warnings.push("Testnet network passphrase used in production/mainnet configuration");
    }
    if (config.databaseUrl.includes("localhost") || config.databaseUrl.includes("127.0.0.1")) {
      warnings.push("Localhost database URL configured for production environment");
    }
    if (config.contractId === "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM") {
      warnings.push("Default placeholder contractId cannot be used in production");
    }
  }
  return warnings;
}

export function validateProductionConfig(config: ApiConfig, isProduction: boolean = true): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (isProduction || config.network === "mainnet") {
    if (config.contractId === "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM") {
      errors.push("Production deployment requires an explicit deployed contractId");
    }
    if (config.network === "mainnet" && config.networkPassphrase !== "Public Global Stellar Network ; September 2015") {
      errors.push("Mainnet network requires the public global Stellar network passphrase");
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function loadApiConfigFromEnv(
  env: Record<string, string | undefined> = (typeof process !== "undefined" ? process.env : {})
): ApiConfig {
  return ApiConfigSchema.parse({
    port: env["API_PORT"] ? parseInt(env["API_PORT"], 10) : 3000,
    host: env["API_HOST"] || "0.0.0.0",
    network: env["STELLAR_NETWORK"] || "testnet",
    databaseUrl: env["DATABASE_URL"] || "postgres://localhost:5432/stellarclear_db",
    contractId: env["STELLAR_CONTRACT_ID"] || "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    rpcUrl: env["STELLAR_RPC_URL"] || "https://soroban-testnet.stellar.org",
    networkPassphrase: env["STELLAR_NETWORK_PASSPHRASE"] || "Test SDF Network ; September 2015",
    enableAnchoring: env["ENABLE_ANCHORING"] === "true" || env["ENABLE_ANCHORING"] === "1",
  });
}

