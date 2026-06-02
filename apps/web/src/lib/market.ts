import { useEffect, useState } from 'react';

export type AssetClass = 'mutual_fund' | 'stock';

export interface Product {
  id: string;
  assetClass: AssetClass;
  name: string;
  ticker: string;
  manager?: string;
  basePrice: number; // in Naira
  risk: 'low' | 'medium' | 'high';
  ratePA?: number; // funds
  blurb: string;
}

export const PRODUCTS: Product[] = [
  // Mutual funds
  { id: 'mmf', assetClass: 'mutual_fund', name: 'Money Market Fund', ticker: 'TT-MMF', manager: 'TellaTrust AM', basePrice: 100, risk: 'low', ratePA: 13.2, blurb: 'Stable, low-risk returns from short-term instruments.' },
  { id: 'bal', assetClass: 'mutual_fund', name: 'Balanced Fund', ticker: 'TT-BAL', manager: 'TellaTrust AM', basePrice: 245, risk: 'medium', ratePA: 17.5, blurb: 'A blend of equities and fixed income for steady growth.' },
  { id: 'euro', assetClass: 'mutual_fund', name: 'Eurobond (USD) Fund', ticker: 'TT-USD', manager: 'TellaTrust AM', basePrice: 1850, risk: 'medium', ratePA: 8.4, blurb: 'Dollar-denominated returns, hedge against naira swings.' },
  { id: 'halal', assetClass: 'mutual_fund', name: 'Halal Fund', ticker: 'TT-HAL', manager: 'TellaTrust AM', basePrice: 132, risk: 'medium', ratePA: 14.1, blurb: 'Shariah-compliant, ethically screened investments.' },
  // Stocks (NGX)
  { id: 'dangcem', assetClass: 'stock', name: 'Dangote Cement', ticker: 'DANGCEM', basePrice: 612.5, risk: 'medium', blurb: "Africa's largest cement producer." },
  { id: 'mtnn', assetClass: 'stock', name: 'MTN Nigeria', ticker: 'MTNN', basePrice: 248.9, risk: 'medium', blurb: "Nigeria's largest telecom operator." },
  { id: 'gtco', assetClass: 'stock', name: 'GTCO Holdings', ticker: 'GTCO', basePrice: 58.4, risk: 'medium', blurb: 'Leading financial services group.' },
  { id: 'zenith', assetClass: 'stock', name: 'Zenith Bank', ticker: 'ZENITHBANK', basePrice: 41.2, risk: 'medium', blurb: 'Tier-1 Nigerian bank.' },
  { id: 'bua', assetClass: 'stock', name: 'BUA Foods', ticker: 'BUAFOODS', basePrice: 392.0, risk: 'high', blurb: 'Integrated food and FMCG producer.' },
  { id: 'airtel', assetClass: 'stock', name: 'Airtel Africa', ticker: 'AIRTELAFRI', basePrice: 1990.0, risk: 'high', blurb: 'Pan-African telecom and mobile money.' },
];

export function productById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export interface PriceTick {
  price: number;
  changePct: number; // since session open
}

/** Simulated live prices: a small random walk around each product's base price. */
export function useLivePrices(): Record<string, PriceTick> {
  const [prices, setPrices] = useState<Record<string, PriceTick>>(() => {
    const init: Record<string, PriceTick> = {};
    for (const p of PRODUCTS) init[p.id] = { price: p.basePrice, changePct: 0 };
    return init;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, PriceTick> = {};
        for (const p of PRODUCTS) {
          const cur = prev[p.id]?.price ?? p.basePrice;
          const vol = p.assetClass === 'stock' ? 0.006 : 0.0015;
          const drift = (Math.random() - 0.48) * vol;
          const price = Math.max(p.basePrice * 0.7, cur * (1 + drift));
          next[p.id] = { price, changePct: ((price - p.basePrice) / p.basePrice) * 100 };
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return prices;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  tag: string;
  sentiment: 'up' | 'down' | 'neutral';
}

export const MARKET_NEWS: NewsItem[] = [
  { id: 'n1', title: 'NGX All-Share Index climbs 1.2% as banking stocks rally', source: 'NGX Today', time: '2h ago', tag: 'Equities', sentiment: 'up' },
  { id: 'n2', title: 'CBN holds benchmark rate; money-market funds stay attractive', source: 'BusinessDay', time: '4h ago', tag: 'Rates', sentiment: 'neutral' },
  { id: 'n3', title: 'Dangote Cement posts record quarterly revenue', source: 'Nairametrics', time: '6h ago', tag: 'DANGCEM', sentiment: 'up' },
  { id: 'n4', title: 'Naira firms against the dollar at the official window', source: 'Reuters', time: '8h ago', tag: 'FX', sentiment: 'up' },
  { id: 'n5', title: 'MTN Nigeria expands 5G coverage to 5 new cities', source: 'TechCabal', time: '1d ago', tag: 'MTNN', sentiment: 'up' },
  { id: 'n6', title: 'Eurobond yields ease as global sentiment improves', source: 'Bloomberg', time: '1d ago', tag: 'Bonds', sentiment: 'neutral' },
];
