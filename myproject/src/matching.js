// Role A — 매칭 알고리즘
// 하드 필터 + 소프트 점수 + 가중치

const FIELD_KEYS = [
  "smoking",
  "sleep",
  "social",
  "noise",
  "region",
  "budget",
];

const PRIORITY_WEIGHTS = [25, 20, 15];


// ==============================
// 공통
// ==============================

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function harmonicMean(a, b) {
  if (a === 0 || b === 0) return 0;
  return (2 * a * b) / (a + b);
}


// ==============================
// 지역
// ==============================

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
      const key = ranks.join("-");

      const score = REGION_SCORE_TABLE[key] ?? 0;

      if (score > best) {
        best = score;
      }
    });
  });

  return best;
}

function regionScore(a, b) {
  return (regionRawScore(a, b) / 15) * 100;
}


// ==============================
// 범위 관련
// ==============================

function rangesOverlap([aMin, aMax], [bMin, bMax]) {
  return Math.min(aMax, bMax) >= Math.max(aMin, bMin);
}

function rangeGap([aMin, aMax], [bMin, bMax]) {
  return Math.max(
    0,
    Math.max(aMin, bMin) - Math.min(aMax, bMax)
  );
}


// ==============================
// 하드 필터
// ==============================

function passesHardFilter(a, b) {

  // --------------------------
  // 성별
  // 체크한 경우에만 하드필터
  // --------------------------

  if (
    a.genderHardFilter === true &&
    !a.preferredGender.includes(b.gender)
  ) {
    return false;
  }

  if (
    b.genderHardFilter === true &&
    !b.preferredGender.includes(a.gender)
  ) {
    return false;
  }


  // --------------------------
  // 나이
  // --------------------------

  if (
    a.ageHardFilter === true &&
    !inRange(b.age, a.ageMin, a.ageMax)
  ) {
    return false;
  }

  if (
    b.ageHardFilter === true &&
    !inRange(a.age, b.ageMin, b.ageMax)
  ) {
    return false;
  }


  // --------------------------
  // 흡연
  // tolerance 0이면 자동 하드필터
  // --------------------------

  if (
    b.isSmoking === true &&
    a.smokingTolerance === 0
  ) {
    return false;
  }

  if (
    a.isSmoking === true &&
    b.smokingTolerance === 0
  ) {
    return false;
  }


  // --------------------------
  // 지역
  // --------------------------

  const regionMatched =
    regionRawScore(a, b) > 0;

  if (
    a.regionHardFilter === true &&
    !regionMatched
  ) {
    return false;
  }

  if (
    b.regionHardFilter === true &&
    !regionMatched
  ) {
    return false;
  }


  // --------------------------
  // 예산
  // --------------------------

  if (
    a.budgetHardFilter === true &&
    !rangesOverlap(a.rentRange, b.rentRange)
  ) {
    return false;
  }

  if (
    b.budgetHardFilter === true &&
    !rangesOverlap(a.rentRange, b.rentRange)
  ) {
    return false;
  }


  // --------------------------
  // 거주기간
  // stayRange가 있을 때만 체크
  // --------------------------

  if (
    a.stayHardFilter === true &&
    a.stayRange &&
    b.stayRange &&
    !rangesOverlap(a.stayRange, b.stayRange)
  ) {
    return false;
  }

  if (
    b.stayHardFilter === true &&
    a.stayRange &&
    b.stayRange &&
    !rangesOverlap(a.stayRange, b.stayRange)
  ) {
    return false;
  }


  return true;
}


// ==============================
// 흡연 점수
// ==============================

function smokingScore(a, b) {

  const scoreTowards = (viewer, other) => {
    if (!other.isSmoking) {
      return 100;
    }

    return viewer.smokingTolerance * 25;
  };

  const aToB = scoreTowards(a, b);
  const bToA = scoreTowards(b, a);

  return harmonicMean(aToB, bToA);
}


// ==============================
// 수면 점수
// ==============================

function rangeScore([aMin, aMax], [bMin, bMax]) {

  const aCenter =
    (aMin + aMax) / 2;

  const bCenter =
    (bMin + bMax) / 2;


  const diff =
    Math.abs(aCenter - bCenter);


  const centerScore =
    Math.max(
      0,
      100 - diff * 20
    );


  const overlap =
    Math.max(
      0,
      Math.min(aMax, bMax)
      -
      Math.max(aMin, bMin)
    );


  const union =
    Math.max(aMax, bMax)
    -
    Math.min(aMin, bMin);


  const overlapScore =
    union > 0
      ? (overlap / union) * 100
      : 100;


  return (
    centerScore * 0.5
    +
    overlapScore * 0.5
  );
}


function sleepScore(a, b) {
  return rangeScore(
    a.sleepRange,
    b.sleepRange
  );
}


// ==============================
// 교류 / 소음
// ==============================

function levelDiffScore(aValue, bValue) {

  const diff =
    Math.abs(aValue - bValue);

  return (
    100
    -
    (diff / 4) * 100
  );
}


// ==============================
// 예산
// ==============================

function budgetRawScore(a, b) {

  if (
    rangesOverlap(
      a.rentRange,
      b.rentRange
    )
  ) {
    return 15;
  }


  const gap =
    rangeGap(
      a.rentRange,
      b.rentRange
    );


  return Math.max(
    0,
    15 - (gap / 5) * 3
  );
}


function budgetScore(a, b) {
  return (
    budgetRawScore(a, b)
    /
    15
  )
  *
  100;
}


// ==============================
// 항목별 점수
// ==============================

function computeBreakdown(a, b) {

  return {

    smoking:
      smokingScore(a, b),

    sleep:
      sleepScore(a, b),

    social:
      levelDiffScore(
        a.socialLevel,
        b.socialLevel
      ),

    noise:
      levelDiffScore(
        a.noiseLevel,
        b.noiseLevel
      ),

    region:
      regionScore(a, b),

    budget:
      budgetScore(a, b),

  };
}


// ==============================
// 가중치
// ==============================

function computeWeights(
  priorities,
  fieldKeys = FIELD_KEYS
) {

  const assigned =
    new Map();


  priorities.forEach(
    (key, i) => {

      if (
        fieldKeys.includes(key) &&
        i < PRIORITY_WEIGHTS.length
      ) {
        assigned.set(
          key,
          PRIORITY_WEIGHTS[i]
        );
      }

    }
  );


  const assignedTotal =
    [...assigned.values()]
      .reduce(
        (sum, weight) =>
          sum + weight,
        0
      );


  const remainingKeys =
    fieldKeys.filter(
      (key) =>
        !assigned.has(key)
    );


  const remainingEach =
    remainingKeys.length > 0
      ? (
          100
          -
          assignedTotal
        )
        /
        remainingKeys.length
      : 0;


  const weights = {};


  fieldKeys.forEach((key) => {

    weights[key] =
      assigned.has(key)
        ? assigned.get(key)
        : remainingEach;

  });


  return weights;
}


// ==============================
// 최종 점수
// ==============================

function weightedScore(
  breakdown,
  weights
) {

  const total =
    FIELD_KEYS.reduce(
      (sum, key) => {

        return (
          sum
          +
          breakdown[key]
          *
          (
            weights[key]
            /
            100
          )
        );

      },
      0
    );


  return Math.round(total);
}


function roundBreakdown(
  breakdown
) {

  const rounded = {};


  for (
    const key
    of FIELD_KEYS
  ) {

    rounded[key] =
      Math.round(
        breakdown[key]
      );

  }


  return rounded;
}


// ==============================
// 매칭
// ==============================

function getMatches(
  myInput,
  priorities,
  seedUsers
) {

  const myWeights =
    computeWeights(
      priorities
    );


  const results =
    seedUsers

      .filter(
        (candidate) =>
          passesHardFilter(
            myInput,
            candidate
          )
      )

      .map(
        (candidate) => {

          const rawBreakdown =
            computeBreakdown(
              myInput,
              candidate
            );


          const breakdown =
            roundBreakdown(
              rawBreakdown
            );


          const mine =
            weightedScore(
              rawBreakdown,
              myWeights
            );


          const theirWeights =
            computeWeights(
              candidate.priorities
              ??
              priorities
            );


          const theirs =
            weightedScore(
              rawBreakdown,
              theirWeights
            );


          return {

            userId:
              candidate.userId,

            finalScore:
              mine,

            breakdown,

            perspective: {
              mine,
              theirs,
            },

          };

        }
      )

      .sort(
        (a, b) =>
          b.finalScore
          -
          a.finalScore
      );


  return results;
}


// ==============================
// export
// ==============================

export {
  getMatches,
  passesHardFilter,
  computeBreakdown,
  computeWeights,
  weightedScore,
  FIELD_KEYS,
};