// Role A — 매칭 알고리즘 (하드 필터 + 소프트 점수 + 가중치)
// 필드명은 C의 seed 데이터 형식(userId, preferredGender, ageMin/ageMax,
// isSmoking, sleepRange, noiseLevel, socialLevel 등)에 맞춤.

const FIELD_KEYS = ["smoking", "sleep", "social", "noise", "region", "budget"];
const PRIORITY_WEIGHTS = [25, 20, 15]; // 1~3순위 가중치(%)

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function passesHardFilter(a, b) {
  if (!a.preferredGender.includes(b.gender) || !b.preferredGender.includes(a.gender)) return false;
  if (!inRange(b.age, a.ageMin, a.ageMax) || !inRange(a.age, b.ageMin, b.ageMax)) return false;
  if (b.isSmoking && a.smokingTolerance === 0) return false;
  if (a.isSmoking && b.smokingTolerance === 0) return false;
  if (regionRawScore(a, b) === 0) return false;
  return true;
}

function smokingScore(a, b) {
  const scoreTowards = (viewer, other) => (other.isSmoking ? viewer.smokingTolerance * 25 : 100);
  return Math.min(scoreTowards(a, b), scoreTowards(b, a));
}

// [min, max] 범위 두 개의 유사도를 계산하는 공용 함수 (현재는 sleepRange 전용).
function rangeScore([aMin, aMax], [bMin, bMax]) {
  const aCenter = (aMin + aMax) / 2;
  const bCenter = (bMin + bMax) / 2;
  const centerScore = Math.max(0, 100 - Math.abs(aCenter - bCenter) * 20);

  const overlap = Math.max(0, Math.min(aMax, bMax) - Math.max(aMin, bMin));
  const union = Math.max(aMax, bMax) - Math.min(aMin, bMin);
  const overlapScore = union > 0 ? (overlap / union) * 100 : 0;

  return centerScore * 0.5 + overlapScore * 0.5;
}

// sleepRange는 자정을 넘기면 25(=익일 1시)처럼 24를 넘겨 표기하는 규칙(C의 seed 데이터 규약)이라
// 값 그대로 rangeScore에 넣으면 됨 — 별도의 자정 보정(shift)이 필요 없음.
function sleepScore(a, b) {
  return rangeScore(a.sleepRange, b.sleepRange);
}

// 교류 희망 정도(socialLevel) / 소음 민감도(noiseLevel, 1~5)의 유사도.
function levelDiffScore(aValue, bValue) {
  const diff = Math.abs(aValue - bValue);
  return 100 - (diff / 4) * 100;
}

// preferredDistricts는 순서대로 1~3지망. 겹치는 지역 중 가장 점수가 높은
// (내 순위, 상대 순위) 조합을 채택 — 순서 무관 대칭 점수표, 15점 만점.
const REGION_SCORE_TABLE = {
  "1-1": 15,
  "1-2": 10,
  "1-3": 7,
  "2-2": 8,
  "2-3": 6,
  "3-3": 5,
};

function regionRawScore(a, b) {
  let best = 0;
  a.preferredDistricts.forEach((districtA, i) => {
    b.preferredDistricts.forEach((districtB, j) => {
      if (districtA !== districtB) return;
      const ranks = [i + 1, j + 1].sort((x, y) => x - y);
      const score = REGION_SCORE_TABLE[ranks.join("-")] ?? 0;
      if (score > best) best = score;
    });
  });
  return best;
}

function regionScore(a, b) {
  return (regionRawScore(a, b) / 15) * 100;
}

// 월세(rentRange)가 겹치면 만점. 아니면 격차로 감점(하드필터 없음).
function rangesOverlap([aMin, aMax], [bMin, bMax]) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin) > 0;
}

function rangeGap([aMin, aMax], [bMin, bMax]) {
  return Math.max(0, Math.max(aMin, bMin) - Math.min(aMax, bMax));
}

function budgetRawScore(a, b) {
  if (rangesOverlap(a.rentRange, b.rentRange)) return 15;
  const rentGap = rangeGap(a.rentRange, b.rentRange);
  return Math.max(0, 15 - (rentGap / 5) * 3);
}

function budgetScore(a, b) {
  return (budgetRawScore(a, b) / 15) * 100;
}

function computeBreakdown(a, b) {
  return {
    smoking: smokingScore(a, b),
    sleep: sleepScore(a, b),
    social: levelDiffScore(a.socialLevel, b.socialLevel),
    noise: levelDiffScore(a.noiseLevel, b.noiseLevel),
    region: regionScore(a, b),
    budget: budgetScore(a, b),
  };
}

// priorities(1~3순위) 기준 25/20/15%, 나머지 항목은 잔여 %를 균등 배분.
function computeWeights(priorities, fieldKeys = FIELD_KEYS) {
  const assigned = new Map();
  priorities.forEach((key, i) => assigned.set(key, PRIORITY_WEIGHTS[i]));

  const assignedTotal = [...assigned.values()].reduce((sum, w) => sum + w, 0);
  const remainingKeys = fieldKeys.filter((key) => !assigned.has(key));
  const remainingEach = remainingKeys.length > 0 ? (100 - assignedTotal) / remainingKeys.length : 0;

  const weights = {};
  for (const key of fieldKeys) {
    weights[key] = assigned.has(key) ? assigned.get(key) : remainingEach;
  }
  return weights;
}

function weightedScore(breakdown, weights) {
  const total = FIELD_KEYS.reduce((sum, key) => sum + breakdown[key] * (weights[key] / 100), 0);
  return Math.round(total);
}

function roundBreakdown(breakdown) {
  const rounded = {};
  for (const key of FIELD_KEYS) rounded[key] = Math.round(breakdown[key]);
  return rounded;
}

// 상대(seed user)가 자기 자신의 priorities를 갖고 있지 않으면
// 일단 나(myInput)의 priorities를 그대로 대입해 "theirs" 점수를 근사한다.
// → B/C 쪽에서 seed user별 priorities를 채워주기 전까지의 임시 처리.
function getMatches(myInput, priorities, seedUsers) {
  const myWeights = computeWeights(priorities);

  const results = seedUsers
    .filter((candidate) => passesHardFilter(myInput, candidate))
    .map((candidate) => {
      const rawBreakdown = computeBreakdown(myInput, candidate);
      const breakdown = roundBreakdown(rawBreakdown);

      const mine = weightedScore(rawBreakdown, myWeights);
      const theirWeights = computeWeights(candidate.priorities ?? priorities);
      const theirs = weightedScore(rawBreakdown, theirWeights);

      return {
        userId: candidate.userId,
        finalScore: mine,
        breakdown,
        perspective: { mine, theirs },
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return results;
}

export {
  getMatches,
  passesHardFilter,
  computeBreakdown,
  computeWeights,
  weightedScore,
  FIELD_KEYS,
};
