# [Role A] 매칭 알고리즘 담당 — 프로젝트 요약

> 이 문서는 새 세션(Claude Code 등)에 붙여넣어 맥락을 이어가기 위한 요약본입니다.
> 담당: **A — 데이터/알고리즘** (Hard 필터, Soft 점수 계산, 가중치 계산 함수 구현)

---

## 1. 프로젝트 한 줄 요약

사용자의 주거 조건과 생활습관을 입력받아, 절대 타협 불가한 조건은 필터링하고 나머지 생활패턴은 범위·유사도를 0~100점으로 환산한 뒤 개인별 중요도(가중치)를 적용하여, 나와 실제로 함께 살기 좋은 쉐어하우스 메이트를 양방향으로 추천하는 해커톤 서비스.

**기술 전제 (확정)**
- DB 없음. Seed 유저 데이터는 JSON 파일로 코드에 포함
- 서버/API 없음. 클라이언트(브라우저)에서 순수 함수로 계산
- 회원가입/로그인 없음 (MVP 범위 밖)

---

## 2. 내가 만들어야 하는 것 (Role A 범위)

하나의 순수 함수로 귀결됨:

```js
function getMatches(myInput, priorities, seedUsers) {
  // 1) Hard 필터로 후보 거르기
  // 2) 남은 후보들의 Soft 항목별 점수 계산
  // 3) priorities 기반 가중치 정규화 후 최종 점수 산출
  // 4) 점수 내림차순 정렬해서 반환
}
```

B(입력 폼)는 이 함수의 `myInput`, `priorities`를 만들어서 넘겨주고, C(결과 화면)는 이 함수의 반환값을 받아서 렌더링만 함. 나는 이 함수 내부 로직 전체를 책임짐.

---

## 3. 합의된 데이터 형태 (Phase 0에서 B/C와 맞춘 스키마)

**입력 객체 (myInput / seedUsers의 각 원소 — 동일 구조)**
```js
{
  gender: "male",                 // 성별
  genderPref: "male",             // 희망 성별
  age: 20,
  ageRange: [20, 24],             // 허용 나이 범위
  smoking: "non_smoker",          // "smoker" | "non_smoker"
  smokingTolerance: 3,            // 0~4 (0=하드컷)
  outing: [8.5, 9.5],             // 외출시간 범위 (24시간제, 소수)
  return: [18, 21],               // 귀가시간 범위
  sleep: [23, 1],                 // 취침시간 범위 (자정 걸침 가능)
  social: 4,                      // 교류 희망 정도 1~5
  noise: 5,                       // 소음 민감도 1~5
}
```

**우선순위 (priorities)**
```js
["noise", "sleep", "social"]   // 1순위, 2순위, 3순위 (필드명 그대로)
```

**출력 형태**
```js
[
  {
    userId: "u01",
    finalScore: 82,
    breakdown: { smoking: 100, outing: 80, return: 90, sleep: 60, social: 75, noise: 50 },
    perspective: { mine: 82, theirs: 76 }   // 양방향 — 아래 6번 참고
  },
  ...
]
```

---

## 4. Hard 필터 (통과 못하면 후보에서 완전 제외)

```
성별: B의 성별 ∈ A의 genderPref  AND  A의 성별 ∈ B의 genderPref
나이: B의 age ∈ A의 ageRange     AND  A의 age ∈ B의 ageRange
흡연: (상대가 smoker) AND (나의 smokingTolerance == 0) → 제외
```
모두 **양방향**으로 확인해야 함 (한쪽만 통과하면 안 됨).

---

## 5. Soft 점수 계산 (0~100점 환산 후 가중치 적용)

### 5.1 흡연 (1~4 구간)
```
score(A→B) = B가 비흡연이면 100, 아니면 A.smokingTolerance × 25
smoking_score = MIN(score(A→B), score(B→A))
```
→ 한쪽이 크게 불편해하면 실제 갈등으로 이어지는 항목이라 평균 대신 MIN 사용.

### 5.2 외출시간 / 귀가시간
```
center = (min + max) / 2
diff = |A.center - B.center|
center_score = max(0, 100 - diff × 20)

overlap = max(0, min(A.max,B.max) - max(A.min,B.min))
union   = max(A.max,B.max) - min(A.min,B.min)
overlap_score = union > 0 ? (overlap/union) × 100 : 0

final = center_score × 0.5 + overlap_score × 0.5
```

### 5.3 취침시간
위와 동일하되, 계산 직전에 자정 보정을 위해 **정오(12시) 기준 시프트** 적용:
```
shift(t) = (t - 12 + 24) % 24     // 23시→11, 1시→13
```
시프트 후 5.2와 동일한 공식 그대로 사용.

### 5.4 교류 희망 정도 / 소음 민감도 (1~5점)
```
diff = |A.value - B.value|      // 0~4
score = 100 - (diff / 4) × 100  // 스케일 무관 정규화
```
⚠️ **미확정**: 이 방식(diff=4일 때 0점) 대신 20점 단위(diff=4일 때 20점 바닥)로 갈지는 팀과 확인 필요.

---

## 6. 가중치 시스템

```
1순위 항목 → 30%
2순위 항목 → 25%
3순위 항목 → 20%
나머지 항목 → (100 - 75) / 나머지 개수, 균등 배분

final_score = Σ (항목점수 × 정규화된 가중치)
```

**양방향 처리 원칙**
- 추천 리스트 정렬: 보는 사람 **본인**의 가중치로 계산한 점수 사용 (A/B가 봤을 때 점수 달라도 정상)
- 상세 화면: `perspective: { mine, theirs }` 형태로 양쪽 점수 다 반환 (UI에서 "당신 기준/상대방 기준" 병기)
- 굳이 대표 점수 하나가 꼭 필요하면 평균 대신 MIN 또는 조화평균 사용 (한쪽 불만족이 뭉개지지 않도록)

---

## 7. 아직 결정 안 된 것 (구현 중 팀과 확인)

1. 교류/소음 점수 단위 — 20점 단위 vs 25점 단위(0점 바닥)
2. 거주기간/예산 — Hard 필터로 뺄지, Soft 점수로 반영할지, 아니면 매칭과 무관하게 "집 추천"에만 쓸지
3. 지역(시/구/동) 처리 방식
4. `breakdown`에 위 미확정 항목들을 추가할지 여부

---

## 8. 단위 테스트용 더미 데이터 예시 (C의 Seed 데이터 기다리지 않고 바로 테스트 가능)

```js
const dummyMe = {
  gender: "male", genderPref: "male", age: 22, ageRange: [20,25],
  smoking: "non_smoker", smokingTolerance: 2,
  outing: [8,10], return: [18,20], sleep: [23,1],
  social: 4, noise: 5
};

const dummyCandidate = {
  gender: "male", genderPref: "male", age: 23, ageRange: [21,26],
  smoking: "smoker", smokingTolerance: 4,
  outing: [9,11], return: [19,21], sleep: [0,2],
  social: 2, noise: 2
};
```
