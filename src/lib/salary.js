// 2026년 연봉 실수령액 계산 (근로자 부담분). 근거는 /tools/salary-calculator/ 페이지 출처 참고.
// 요율은 부동소수점 오차를 피하려고 [분자, 분모]로 둔다.
export const RATES = {
  pension: [475, 10000], // 국민연금 9.5%의 절반 = 4.75%
  pensionMin: 410000, // 기준소득월액 하한 (2026.7.1~2027.6.30)
  pensionMax: 6590000, // 기준소득월액 상한 (2026.7.1~2027.6.30)
  health: [3595, 100000], // 건강보험 7.19%의 절반 = 3.595%
  care: [9448, 71900], // 장기요양: 건강보험료 × (0.9448% ÷ 7.19%)
  employment: [9, 1000], // 고용보험 실업급여 1.8%의 절반 = 0.9%
};

const floor10 = (n) => Math.floor(n / 10) * 10;
const mul10 = (amount, [num, den]) => Math.floor((amount * num) / (den * 10)) * 10;

// 자녀(8세 이상 20세 이하) 세액 공제분: 1명 20,830 / 2명 45,830 / 3명부터 1명당 33,330 추가
export function childCredit(n) {
  if (n <= 0) return 0;
  if (n === 1) return 20830;
  return 45830 + (n - 2) * 33330;
}

// 간이세액표 소득세 (월급여액: 비과세 제외, 원)
export function tableTax(table, monthly, family) {
  const col = Math.min(Math.max(family, 1), 11) + 1;
  const k = monthly / 1000; // 천원
  const rows = table.rows;
  if (k < rows[0][0]) return 0;
  if (k < 10000) {
    // 구간 [lower, upper)
    let lo = 0, hi = rows.length - 2;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (rows[mid][0] <= k) lo = mid; else hi = mid - 1;
    }
    return rows[lo][col];
  }
  const base = rows[rows.length - 1][col]; // 10,000천원
  const won = monthly;
  if (won <= 10000000) return base;
  // 98% × 세율은 정수 비율로: 0.98×0.35 = 343/1000, 0.98×0.38 = 3724/10000, 0.98×0.40 = 392/1000
  let extra;
  if (won <= 14000000) extra = ((won - 10000000) * 343) / 1000 + 25000;
  else if (won <= 28000000) extra = 1397000 + ((won - 14000000) * 3724) / 10000;
  else if (won <= 30000000) extra = 6610600 + ((won - 28000000) * 392) / 1000;
  else if (won <= 45000000) extra = 7394600 + ((won - 30000000) * 40) / 100;
  else if (won <= 87000000) extra = 13394600 + ((won - 45000000) * 42) / 100;
  else extra = 31034600 + ((won - 87000000) * 45) / 100;
  return floor10(base + extra);
}

export function calcSalary(table, { annual, nonTaxMonthly = 0, family = 1, children = 0 }) {
  const gross = Math.floor(annual / 12);
  const nonTax = Math.min(nonTaxMonthly, gross);
  const taxable = gross - nonTax;

  const pensionBase = Math.min(Math.max(Math.floor(taxable / 1000) * 1000, RATES.pensionMin), RATES.pensionMax);
  const pension = taxable > 0 ? mul10(pensionBase, RATES.pension) : 0;
  const health = mul10(taxable, RATES.health);
  const care = mul10(health, RATES.care);
  const employment = mul10(taxable, RATES.employment);

  const kids = Math.min(children, Math.max(family - 1, 0));
  const incomeTax = Math.max(tableTax(table, taxable, family) - childCredit(kids), 0);
  const localTax = floor10(incomeTax * 0.1);

  const deductions = pension + health + care + employment + incomeTax + localTax;
  return { gross, nonTax, taxable, pensionBase, pension, health, care, employment, incomeTax, localTax, deductions, net: gross - deductions };
}
