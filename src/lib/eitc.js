// 근로장려금 산정 (조세특례제한법 시행령 별표11 근로장려금 산정표, 2025.2.28 개정)
export const TYPES = ['single', 'hol', 'mat'];
export const INCOME_LIMIT = { single: 22000000, hol: 32000000, mat: 44000000 }; // 부부합산 총소득 미만
export const ASSET_LIMIT = 240000000; // 미만
export const ASSET_HALF = 170000000; // 이상이면 50%
export const LATE_RATE = 0.95; // 기한 후 신청

// 산정표 금액 (총급여액등 기준). 표 범위 밖이거나 '해당 없음'이면 0
export function tableAmount(table, earned, type) {
  const col = 2 + TYPES.indexOf(type);
  const row = table.rows.find((r) => earned >= r[0] && earned < r[1]);
  return row && row[col] ? row[col] : 0;
}

export function calcEitc(table, { type, earned, otherIncome = 0, assets = 0, late = false }) {
  const total = earned + otherIncome;
  const reasons = [];
  if (type === 'mat' && earned < 6000000) reasons.push('맞벌이가구는 부부 합산 총급여액등이 600만원 미만이면 산정표에 금액이 없습니다.');
  if (total >= INCOME_LIMIT[type]) reasons.push(`부부 합산 총소득이 ${(INCOME_LIMIT[type] / 10000).toLocaleString('ko-KR')}만원 미만이어야 합니다.`);
  if (assets >= ASSET_LIMIT) reasons.push('가구원 재산 합계가 2억 4,000만원 미만이어야 합니다.');

  const base = tableAmount(table, earned, type);
  if (!reasons.length && base === 0) reasons.push('입력한 총급여액등 구간은 산정표상 지급액이 없습니다.');
  const eligible = reasons.length === 0;
  const halfApplied = assets >= ASSET_HALF;
  let amount = eligible ? base : 0;
  if (halfApplied) amount = Math.floor(amount * 0.5);
  if (late) amount = Math.floor(amount * LATE_RATE);
  return { eligible, reasons, base: eligible ? base : 0, halfApplied, late, amount };
}
