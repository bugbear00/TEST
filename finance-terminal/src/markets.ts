/** 시장 개요 대시보드에 표시할 큐레이션 심볼 그룹 */
export interface MarketGroup {
  id: string;
  label: string;
  symbols: { sym: string; label: string }[];
}

export const MARKET_GROUPS: MarketGroup[] = [
  {
    id: 'us_index',
    label: '미국 지수',
    symbols: [
      { sym: '^GSPC', label: 'S&P 500' },
      { sym: '^IXIC', label: '나스닥 종합' },
      { sym: '^DJI', label: '다우존스' },
      { sym: '^RUT', label: '러셀 2000' },
      { sym: '^VIX', label: 'VIX 변동성' },
    ],
  },
  {
    id: 'kr_index',
    label: '한국 지수',
    symbols: [
      { sym: '^KS11', label: '코스피' },
      { sym: '^KQ11', label: '코스닥' },
    ],
  },
  {
    id: 'etf',
    label: '주요 ETF',
    symbols: [
      { sym: 'SPY', label: 'S&P500 (SPY)' },
      { sym: 'QQQ', label: '나스닥100 (QQQ)' },
      { sym: 'DIA', label: '다우 (DIA)' },
      { sym: 'IWM', label: '러셀2000 (IWM)' },
      { sym: 'TLT', label: '美 장기국채 (TLT)' },
      { sym: 'GLD', label: '금 ETF (GLD)' },
      { sym: 'EWY', label: '한국 ETF (EWY)' },
    ],
  },
  {
    id: 'fx',
    label: '환율',
    symbols: [
      { sym: 'KRW=X', label: '달러/원 (USD/KRW)' },
      { sym: 'EURUSD=X', label: '유로/달러' },
      { sym: 'JPY=X', label: '달러/엔' },
      { sym: 'DX-Y.NYB', label: '달러 인덱스(DXY)' },
    ],
  },
  {
    id: 'commodity',
    label: '원자재',
    symbols: [
      { sym: 'GC=F', label: '금(Gold)' },
      { sym: 'SI=F', label: '은(Silver)' },
      { sym: 'CL=F', label: 'WTI 원유' },
      { sym: 'BZ=F', label: '브렌트유' },
      { sym: 'NG=F', label: '천연가스' },
    ],
  },
  {
    id: 'crypto',
    label: '암호화폐',
    symbols: [
      { sym: 'BTC-USD', label: '비트코인' },
      { sym: 'ETH-USD', label: '이더리움' },
    ],
  },
];
