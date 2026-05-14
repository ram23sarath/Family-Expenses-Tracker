import type { ProviderType } from "@/lib/types";
import type { BrokerConnector } from "@/lib/integrations/brokers/types";
import { zerodhaConnector } from "@/lib/integrations/brokers/zerodha";
import { growwConnector } from "@/lib/integrations/brokers/groww";

const connectors: Partial<Record<ProviderType, BrokerConnector>> = {
  zerodha: zerodhaConnector,
  groww: growwConnector
};

export const getBrokerConnector = (provider: ProviderType) => connectors[provider];
