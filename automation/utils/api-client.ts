/**
 * LI.FI API Client wrapper for Playwright tests
 */

import { APIRequestContext } from '@playwright/test';

export interface QuoteParams {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress?: string;
  slippage?: number;
  order?: 'FASTEST' | 'CHEAPEST';
}

export interface RoutesParams {
  fromChainId: number;
  fromAmount: string;
  fromTokenAddress: string;
  toChainId: number;
  toTokenAddress: string;
  fromAddress?: string;
  toAddress?: string;
  options?: {
    slippage?: number;
    order?: 'FASTEST' | 'CHEAPEST';
  };
}

export class LiFiApiClient {
  constructor(private request: APIRequestContext) {}

  /**
   * GET /v1/quote - Request a quote for a token transfer
   */
  async getQuote(params: QuoteParams) {
    const searchParams = new URLSearchParams({
      fromChain: params.fromChain.toString(),
      toChain: params.toChain.toString(),
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
    });

    if (params.toAddress) {
      searchParams.set('toAddress', params.toAddress);
    }
    if (params.slippage !== undefined) {
      searchParams.set('slippage', params.slippage.toString());
    }
    if (params.order) {
      searchParams.set('order', params.order);
    }

    return this.request.get(`/quote?${searchParams}`);
  }

  /**
   * POST /v1/advanced/routes - Get multiple route options
   */
  async getRoutes(params: RoutesParams) {
    return this.request.post('/advanced/routes', {
      data: {
        fromChainId: params.fromChainId,
        fromAmount: params.fromAmount,
        fromTokenAddress: params.fromTokenAddress,
        toChainId: params.toChainId,
        toTokenAddress: params.toTokenAddress,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        options: params.options,
      },
    });
  }

  /**
   * GET /v1/tools - Get available bridges and exchanges
   */
  async getTools(chains?: number[]) {
    const params = chains ? `?chains=${chains.join(',')}` : '';
    return this.request.get(`/tools${params}`);
  }

  /**
   * GET /v1/chains - Get supported chains
   */
  async getChains(chainTypes?: string) {
    const params = chainTypes ? `?chainTypes=${chainTypes}` : '';
    return this.request.get(`/chains${params}`);
  }

  /**
   * GET /v1/tokens - Get supported tokens
   */
  async getTokens(chains?: number[]) {
    const params = chains ? `?chains=${chains.join(',')}` : '';
    return this.request.get(`/tokens${params}`);
  }
}
