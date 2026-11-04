// 2026년 귀속 연말정산 예상 환급액 계산 (근로소득만 있는 거주자 기준).
// 근거는 /tools/year-end-tax-calculator/ 페이지의 참고 자료 참고. 금액 단위는 원.

// 소득세법 제47조 ① 근로소득공제 (한도 2천만원)
export function earnedIncomeDeduction(total) {
  let d;
  if (total <= 5000000) d = (total * 70) / 100;
  else if (total <= 15000000) d = 3500000 + ((total - 5000000) * 40) / 100;
  else if (total <= 45000000) d = 7500000 + ((total - 15000000) * 15) / 100;
  else if (total <= 100000000) d = 12000000 + ((total - 45000000) * 5) / 100;
  else d = 14750000 + ((total - 100000000) * 2) / 100;
  return Math.floor(Math.min(d, 20000000, total));
}

// 소득세법 제55조 기본세율 (2023년 이후 귀속)
const BRACKETS = [
  [14000000, 6, 0],
  [50000000, 15, 1260000],
  [88000000, 24, 5760000],
  [150000000, 35, 15440000],
  [300000000, 38, 19940000],
  [500000000, 40, 25940000],
  [1000000000, 42, 35940000],
  [Infinity, 45, 65940000],
];
export function basicTax(base) {
  if (base <= 0) return 0;
  const [, rate, prog] = BRACKETS.find(([upper]) => base <= upper);
  return Math.floor((base * rate) / 100 - prog);
}

// 소득세법 제59조 근로소득세액공제
export function earnedIncomeCredit(calcTax, total) {
  const raw = calcTax <= 1300000 ? (calcTax * 55) / 100 : 715000 + ((calcTax - 1300000) * 30) / 100;
  let cap;
  if (total <= 33000000) cap = 740000;
  else if (total <= 70000000) cap = Math.max(740000 - ((total - 33000000) * 8) / 1000, 660000);
  else if (total <= 120000000) cap = Math.max(660000 - (total - 70000000) / 2, 500000);
  else cap = Math.max(500000 - (total - 120000000) / 2, 200000);
  return Math.floor(Math.min(raw, cap));
}

// 소득세법 제59조의2 자녀세액공제 (2026년 귀속: 9세 이상, 2017년생 제외 → 2006~2016년생)
export function childCredit(n) {
  if (n <= 0) return 0;
  if (n === 1) return 250000;
  return 550000 + (n - 2) * 400000;
}
// 출산·입양: 0 없음, 1 첫째, 2 둘째, 3 셋째 이상
export const BIRTH_CREDIT = [0, 300000, 500000, 700000];

// 조세특례제한법 제126조의2 신용카드 등 소득공제
export function cardDeduction(total, { credit = 0, debit = 0, market = 0 }, kids = 0) {
  const over7 = total > 70000000;
  const threshold = Math.floor((total * 25) / 100);
  // 문턱은 공제율이 낮은 사용분부터 뺀다: 신용(15%) → 체크·현금(30%) → 전통시장·대중교통(40%)
  let left = threshold;
  const take = (amt) => { const t = Math.min(amt, left); left -= t; return amt - t; };
  const c = take(credit);
  const d = take(debit);
  const m = take(market);
  const gross = (c * 15) / 100 + (d * 30) / 100 + (m * 40) / 100;
  const marketPart = (m * 40) / 100;
  const k = Math.min(kids, 2);
  const basicLimit = over7 ? [2500000, 2750000, 3000000][k] : [3000000, 3500000, 4000000][k];
  const extraLimit = over7 ? 2000000 : 3000000;
  if (gross <= basicLimit) return { deduction: Math.floor(gross), threshold, gross: Math.floor(gross), basicLimit };
  const extra = Math.min(gross - basicLimit, marketPart, extraLimit);
  return { deduction: Math.floor(basicLimit + extra), threshold, gross: Math.floor(gross), basicLimit };
}

// 소득세법 제59조의3 연금계좌세액공제
export function pensionCredit(total, saving, irp) {
  const base = Math.min(Math.min(saving, 6000000) + irp, 9000000);
  const rate = total <= 55000000 ? 15 : 12;
  return { base, rate, credit: Math.floor((base * rate) / 100) };
}

// 조세특례제한법 제95조의2 월세 세액공제 (총급여 8천만원 이하, 연 1천만원 한도)
export function rentCredit(total, rent) {
  if (total > 80000000 || rent <= 0) return { base: 0, rate: 0, credit: 0 };
  const base = Math.min(rent, 10000000);
  const rate = total <= 55000000 ? 17 : 15;
  return { base, rate, credit: Math.floor((base * rate) / 100) };
}

// 소득세법 제59조의4 ② 의료비 세액공제 (15% 구간만: 일반 700만원 한도, 본인·65세 이상·6세 이하·장애인 등 한도 없음)
export function medicalCredit(total, general, special) {
  const threshold = Math.floor((total * 3) / 100);
  const g = Math.max(general - threshold, 0);
  const short = Math.max(threshold - general, 0);
  const s = Math.max(special - short, 0);
  const base = Math.min(g, 7000000) + s;
  return { threshold, base, credit: Math.floor((base * 15) / 100) };
}

export function calcYearEnd(i) {
  const total = Math.max(i.total || 0, 0);
  const family = Math.max(i.family || 1, 1);
  const eid = earnedIncomeDeduction(total);
  const earned = total - eid;
  const personal = family * 1500000;
  const insurance = (i.pension || 0) + (i.social || 0);
  const card = cardDeduction(total, i.cards || {}, i.cardKids || 0);
  const taxBase = Math.max(earned - personal - insurance - card.deduction, 0);
  const calcTax = basicTax(taxBase);

  const eic = earnedIncomeCredit(calcTax, total);
  const child = childCredit(i.childCreditKids || 0) + (BIRTH_CREDIT[i.birth || 0] || 0);
  const pen = pensionCredit(total, i.saving || 0, i.irp || 0);
  const rent = rentCredit(total, i.rent || 0);
  const med = medicalCredit(total, i.medGeneral || 0, i.medSpecial || 0);
  // 의료비·월세 공제를 받으면 표준세액공제(13만원)는 받을 수 없으므로 더 큰 쪽을 고른다
  const itemized = rent.credit + med.credit;
  const useStandard = itemized < 130000;
  const special = useStandard ? 130000 : itemized;

  const credits = eic + child + pen.credit + special;
  const decided = Math.max(calcTax - credits, 0);
  const decidedLocal = Math.floor(decided / 10);
  const paid = Math.max(i.paid || 0, 0);
  const paidLocal = Math.floor(paid / 10);
  const refund = paid - decided + (paidLocal - decidedLocal);

  return {
    total, eid, earned, personal, insurance, card, taxBase, calcTax,
    eic, child, pen, rent, med, useStandard, special, credits,
    decided, decidedLocal, paid, paidLocal, refund,
  };
}
