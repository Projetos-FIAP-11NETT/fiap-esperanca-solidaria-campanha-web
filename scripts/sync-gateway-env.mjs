// O LocalStack não persiste nada: a cada restart a REST API do gateway é
// recriada com um id novo. Este script descobre o id atual e grava
// VITE_GATEWAY_BASE_URL no .env.development (gitignored), pra ninguém ter que
// caçar o id na mão. Roda sozinho antes do `npm run dev` (predev) e nunca
// derruba o dev server: se o LocalStack não responder, só avisa.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const HOST = process.env.GATEWAY_HOST ?? "http://localhost:30466";
const API_NAME = process.env.GATEWAY_API_NAME ?? "local-api-gateway-v1";
const STAGE = process.env.GATEWAY_STAGE ?? "dev";
const ENV_FILE = fileURLToPath(new URL("../.env.development", import.meta.url));
const KEY = "VITE_GATEWAY_BASE_URL";

async function findRestApiId() {
  // Sem esse header o edge do LocalStack não sabe que /restapis é do
  // apigateway e cai no S3 (NoSuchBucket) — o escopo da credencial é o que roteia.
  const response = await fetch(`${HOST}/restapis`, {
    headers: {
      Authorization:
        "AWS4-HMAC-SHA256 Credential=test/20260101/us-east-1/apigateway/aws4_request, SignedHeaders=host, Signature=x",
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const { item = [] } = await response.json();
  const api = item.find((candidate) => candidate.name === API_NAME);
  if (!api) throw new Error(`nenhuma REST API chamada "${API_NAME}" (rode o terraform apply em terraform/k8s)`);
  return api.id;
}

function upsertEnvLine(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content}${content && !content.endsWith("\n") ? "\n" : ""}${line}\n`;
}

try {
  const id = await findRestApiId();
  const url = `${HOST}/restapis/${id}/${STAGE}/_user_request_`;
  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  const next = upsertEnvLine(current, KEY, url);

  if (next !== current) {
    writeFileSync(ENV_FILE, next);
    console.log(`[gateway] ${KEY} atualizado -> id ${id}`);
  } else {
    console.log(`[gateway] ${KEY} já está correto (id ${id})`);
  }
} catch (error) {
  console.warn(`[gateway] não consegui descobrir o id do gateway em ${HOST}: ${error.message}`);
  console.warn("[gateway] mantendo o .env.development como está.");
}
