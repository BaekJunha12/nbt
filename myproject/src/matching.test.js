import { test } from "node:test";
import assert from "node:assert/strict";
import { getMatches, passesHardFilter, computeWeights } from "./matching.js";

const dummyMe = {
  userId: "user_m00",
  name: "테스터",
  gender: "male",
  preferredGender: ["male"],
  age: 22,
  ageMin: 20,
  ageMax: 25,
  preferredDistricts: ["성북구", "동대문구"],
  isSmoking: false,
  smokingTolerance: 2,
  sleepRange: [23, 25],
  noiseLevel: 5,
  socialLevel: 4,
  stayDuration: 6,
  intro: "",
};

const dummyCandidate = {
  userId: "user_m01",
  name: "김민준",
  gender: "male",
  preferredGender: ["male"],
  age: 23,
  ageMin: 20,
  ageMax: 26,
  preferredDistricts: ["성북구", "동대문구", "종로구"],
  isSmoking: false,
  smokingTolerance: 0,
  sleepRange: [23, 25],
  noiseLevel: 2,
  socialLevel: 4,
  stayDuration: 12,
  intro: "고려대 재학 중입니다! 밤에 조용히 잘 자는 성향이고 규칙적인 라이프스타일을 선호해요.",
};

const priorities = ["noise", "sleep", "social"];

test("seed 데이터 형식(user_m01)으로 매칭 결과가 나온다", () => {
  const [result] = getMatches(dummyMe, priorities, [dummyCandidate]);
  assert.equal(result.userId, "user_m01");
  assert.equal(result.finalScore, result.perspective.mine);
  assert.ok(result.finalScore >= 0 && result.finalScore <= 100);
  assert.deepEqual(Object.keys(result.breakdown).sort(), ["noise", "sleep", "smoking", "social"]);
});

test("가중치는 항상 합이 100이 된다", () => {
  const weights = computeWeights(priorities);
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  assert.ok(Math.abs(total - 100) < 1e-9);
});

test("preferredGender에 상대 성별이 없으면 하드필터에서 제외된다", () => {
  const other = { ...dummyCandidate, gender: "female", preferredGender: ["male"] };
  assert.equal(passesHardFilter(dummyMe, other), false);
});

test("나이 범위(ageMin/ageMax)를 벗어나면 하드필터에서 제외된다", () => {
  const other = { ...dummyCandidate, age: 40 };
  assert.equal(passesHardFilter(dummyMe, other), false);
});

test("smokingTolerance가 0인데 상대가 흡연자(isSmoking)면 제외된다", () => {
  const me = { ...dummyMe, smokingTolerance: 0 };
  const smoker = { ...dummyCandidate, isSmoking: true };
  assert.equal(passesHardFilter(me, smoker), false);
});

test("하드필터를 통과 못하면 getMatches 결과에서 빠진다", () => {
  const rejected = { ...dummyCandidate, userId: "user_f01", gender: "female", preferredGender: ["male"] };
  const results = getMatches(dummyMe, priorities, [dummyCandidate, rejected]);
  assert.equal(results.length, 1);
  assert.equal(results[0].userId, "user_m01");
});

test("동일한 생활패턴끼리는 항목별 점수가 100에 가깝다", () => {
  const twin = { ...dummyMe, userId: "user_m02" };
  const [result] = getMatches(dummyMe, priorities, [twin]);
  assert.equal(result.breakdown.smoking, 100);
  assert.equal(result.breakdown.sleep, 100);
  assert.equal(result.breakdown.social, 100);
  assert.equal(result.breakdown.noise, 100);
});
