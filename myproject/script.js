import { getMatches } from "./src/matching.js";
import { seedUsers } from "./seedUsers.js";

const seedUsersById = new Map(seedUsers.map((user) => [user.userId, user]));

let currentPage = 1;


// ========================================
// 사용자 입력 데이터
// ========================================

const profileData = {

    gender: null,

    birthDate: null,

    stayMin: 6,
    stayMax: 24,
    stayHardFilter: false,

    budgetMin: 30,
    budgetMax: 80,
    budgetHardFilter: false,

    regionFirst: "",
    regionSecond: "",
    regionThird: "",
    regionHardFilter: false,

    socialLevel: null,

    noiseSensitivity: null,

    sleepStart: null,
    sleepEnd: null,

    smoking: null,


    // 선호도

    preferredGender: null,
    genderHardFilter: false,

    preferredAgeMin: 20,
    preferredAgeMax: 30,
    ageHardFilter: false,

    smokingTolerance: null
};


// ========================================
// 페이지 이동
// ========================================

function goToPage(pageNumber) {

    document
        .querySelectorAll(".page")
        .forEach((page) => {

            page.classList.remove("active");

        });


    const target =
        document.getElementById(
            `page${pageNumber}`
        );


    if (!target) {

        console.error(
            `page${pageNumber} 없음`
        );

        return;
    }


    target.classList.add("active");

    currentPage = pageNumber;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    // 안내 페이지
    if (pageNumber === 2) {

        setTimeout(() => {

            if (currentPage === 2) {

                goToPage(3);

            }

        }, 3000);

    }
}


// ========================================
// 성별
// ========================================

function selectGender(
    gender,
    button
) {

    profileData.gender = gender;


    document
        .querySelectorAll(
            "#page3 .choice-button"
        )
        .forEach((btn) => {

            btn.classList.remove(
                "selected"
            );

        });


    button.classList.add("selected");


    document.getElementById(
        "genderNext"
    ).disabled = false;
}


// ========================================
// 생년월일
// ========================================

function validateBirthDate() {

    const value =
        document.getElementById(
            "birthDate"
        ).value;


    profileData.birthDate = value;


    document.getElementById(
        "birthNext"
    ).disabled = !value;
}


// ========================================
// 듀얼 슬라이더 공통
// ========================================

function updateDualSlider(
    minSlider,
    maxSlider,
    selectedRange
) {

    let minValue =
        Number(minSlider.value);

    let maxValue =
        Number(maxSlider.value);


    if (minValue > maxValue) {

        minValue = maxValue;

        minSlider.value =
            maxValue;

    }


    const sliderMin =
        Number(minSlider.min);

    const sliderMax =
        Number(minSlider.max);


    const minPercent =
        (
            (minValue - sliderMin)
            /
            (sliderMax - sliderMin)
        )
        * 100;


    const maxPercent =
        (
            (maxValue - sliderMin)
            /
            (sliderMax - sliderMin)
        )
        * 100;


    selectedRange.style.left =
        `${minPercent}%`;


    selectedRange.style.width =
        `${maxPercent - minPercent}%`;
}


// ========================================
// 거주기간
// ========================================

const stayMinSlider =
    document.getElementById(
        "stayMin"
    );

const stayMaxSlider =
    document.getElementById(
        "stayMax"
    );

const staySelectedRange =
    document.getElementById(
        "staySelectedRange"
    );


function updateStayRange() {

    let min =
        Number(stayMinSlider.value);

    let max =
        Number(stayMaxSlider.value);


    if (min > max) {

        if (
            document.activeElement
            === stayMinSlider
        ) {

            stayMinSlider.value =
                max;

            min = max;

        }
        else {

            stayMaxSlider.value =
                min;

            max = min;

        }

    }


    profileData.stayMin = min;
    profileData.stayMax = max;


    document.getElementById(
        "stayMinText"
    ).textContent =
        formatStay(min);


    document.getElementById(
        "stayMaxText"
    ).textContent =
        formatStay(max);


    updateDualSlider(
        stayMinSlider,
        stayMaxSlider,
        staySelectedRange
    );
}


function formatStay(months) {

    if (months < 12) {

        return `${months}개월`;

    }


    const year =
        Math.floor(months / 12);

    const remain =
        months % 12;


    if (remain === 0) {

        return `${year}년`;

    }


    return `${year}년 ${remain}개월`;
}


stayMinSlider.addEventListener(
    "input",
    updateStayRange
);

stayMaxSlider.addEventListener(
    "input",
    updateStayRange
);


document
    .getElementById(
        "stayHardFilter"
    )
    .addEventListener(
        "change",
        function () {

            profileData.stayHardFilter =
                this.checked;

        }
    );


// ========================================
// 예산
// ========================================

const budgetMinSlider =
    document.getElementById(
        "budgetMin"
    );

const budgetMaxSlider =
    document.getElementById(
        "budgetMax"
    );

const budgetSelectedRange =
    document.getElementById(
        "budgetSelectedRange"
    );


function updateBudgetRange() {

    let min =
        Number(
            budgetMinSlider.value
        );

    let max =
        Number(
            budgetMaxSlider.value
        );


    if (min > max) {

        if (
            document.activeElement
            === budgetMinSlider
        ) {

            budgetMinSlider.value =
                max;

            min = max;

        }
        else {

            budgetMaxSlider.value =
                min;

            max = min;

        }

    }


    profileData.budgetMin = min;
    profileData.budgetMax = max;


    document.getElementById(
        "budgetMinText"
    ).textContent =
        `${min}만원`;


    document.getElementById(
        "budgetMaxText"
    ).textContent =
        `${max}만원`;


    updateDualSlider(
        budgetMinSlider,
        budgetMaxSlider,
        budgetSelectedRange
    );
}


budgetMinSlider.addEventListener(
    "input",
    updateBudgetRange
);

budgetMaxSlider.addEventListener(
    "input",
    updateBudgetRange
);


document
    .getElementById(
        "budgetHardFilter"
    )
    .addEventListener(
        "change",
        function () {

            profileData.budgetHardFilter =
                this.checked;

        }
    );


// ========================================
// 지역
// ========================================

const seoulDistricts = [

    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구"

];


function createRegionOptions() {

    const ids = [

        "regionFirst",
        "regionSecond",
        "regionThird"

    ];


    ids.forEach((id) => {

        const select =
            document.getElementById(id);


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value = "";

        placeholder.textContent =
            "지역 선택";

        placeholder.disabled = true;

        placeholder.selected = true;


        select.appendChild(
            placeholder
        );


        seoulDistricts.forEach(
            (district) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    district;

                option.textContent =
                    district;


                select.appendChild(
                    option
                );

            }
        );

    });
}


function validateRegions() {

    const first =
        document.getElementById(
            "regionFirst"
        ).value;


    const second =
        document.getElementById(
            "regionSecond"
        ).value;


    const third =
        document.getElementById(
            "regionThird"
        ).value;


    profileData.regionFirst =
        first;

    profileData.regionSecond =
        second;

    profileData.regionThird =
        third;


    const selected =
        [first, second, third];


    const allSelected =
        selected.every(Boolean);


    const noDuplicate =
        new Set(selected).size === 3;


    document.getElementById(
        "regionNext"
    ).disabled =
        !(allSelected && noDuplicate);
}


document
    .getElementById(
        "regionHardFilter"
    )
    .addEventListener(
        "change",
        function () {

            profileData.regionHardFilter =
                this.checked;

        }
    );


// ========================================
// 교류
// ========================================

function validateSocial() {

    const selected =
        document.querySelector(
            'input[name="social"]:checked'
        );


    if (!selected) {
        return;
    }


    profileData.socialLevel =
        Number(selected.value);


    document.getElementById(
        "socialNext"
    ).disabled = false;
}


// ========================================
// 소음
// ========================================

function validateNoise() {

    const selected =
        document.querySelector(
            'input[name="noise"]:checked'
        );


    if (!selected) {
        return;
    }


    profileData.noiseSensitivity =
        Number(selected.value);


    document.getElementById(
        "noiseNext"
    ).disabled = false;
}


// ========================================
// 수면
// ========================================

function updateSleepTime() {

    const value =
        document.getElementById(
            "sleepStartInput"
        ).value;


    if (!value) {

        return;

    }


    const [
        hour,
        minute
    ] =
        value
        .split(":")
        .map(Number);


    const startMinutes =
        hour * 60 + minute;


    const endMinutes =
        (
            startMinutes + 120
        )
        % 1440;


    const endHour =
        Math.floor(
            endMinutes / 60
        );


    const endMinute =
        endMinutes % 60;


    const endText =
        String(endHour)
        .padStart(2, "0")
        +
        ":"
        +
        String(endMinute)
        .padStart(2, "0");


    document.getElementById(
        "sleepResult"
    ).textContent =
        `${value} ~ ${endText}`;


    profileData.sleepStart =
        toExtendedHour(
            hour,
            minute
        );


    profileData.sleepEnd =
        profileData.sleepStart
        + 2;


    document.getElementById(
        "sleepNext"
    ).disabled = false;
}


// seedUsers.js의 sleepRange 표기(자정 이후는 24를 더해 25시, 26시 식으로 표기)에 맞춘 변환.
// 예: 23:00 -> 23, 01:00 -> 25
function toExtendedHour(
    hour,
    minute
) {

    const extendedHour =
        hour < 12
            ? hour + 24
            : hour;

    return (
        extendedHour
        + minute / 60
    );
}


// ========================================
// 본인 흡연
// ========================================

function selectSmoking(
    smoking,
    button
) {

    profileData.smoking =
        smoking;


    document
        .querySelectorAll(
            ".smoking-button"
        )
        .forEach((btn) => {

            btn.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    document.getElementById(
        "smokingNext"
    ).disabled = false;
}


// ========================================
// 선호 성별
// ========================================

function selectPreferredGender(
    gender,
    button
) {

    profileData.preferredGender =
        gender;


    document
        .querySelectorAll(
            ".preferred-gender-button"
        )
        .forEach((btn) => {

            btn.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    document.getElementById(
        "preferredGenderNext"
    ).disabled = false;
}


document
    .getElementById(
        "genderHardFilter"
    )
    .addEventListener(
        "change",
        function () {

            profileData.genderHardFilter =
                this.checked;

        }
    );


// ========================================
// 선호 나이
// ========================================

const ageMinSlider =
    document.getElementById(
        "ageMin"
    );

const ageMaxSlider =
    document.getElementById(
        "ageMax"
    );

const ageSelectedRange =
    document.getElementById(
        "ageSelectedRange"
    );


function updateAgeRange() {

    let min =
        Number(
            ageMinSlider.value
        );

    let max =
        Number(
            ageMaxSlider.value
        );


    if (min > max) {

        if (
            document.activeElement
            === ageMinSlider
        ) {

            ageMinSlider.value =
                max;

            min = max;

        }
        else {

            ageMaxSlider.value =
                min;

            max = min;

        }

    }


    profileData.preferredAgeMin =
        min;

    profileData.preferredAgeMax =
        max;


    document.getElementById(
        "ageMinText"
    ).textContent =
        `${min}세`;


    document.getElementById(
        "ageMaxText"
    ).textContent =
        `${max}세`;


    updateDualSlider(
        ageMinSlider,
        ageMaxSlider,
        ageSelectedRange
    );
}


ageMinSlider.addEventListener(
    "input",
    updateAgeRange
);

ageMaxSlider.addEventListener(
    "input",
    updateAgeRange
);


document
    .getElementById(
        "ageHardFilter"
    )
    .addEventListener(
        "change",
        function () {

            profileData.ageHardFilter =
                this.checked;

        }
    );


// ========================================
// 흡연 선호
// ========================================

function validateSmokingPreference() {

    const selected =
        document.querySelector(
            'input[name="smokingPreference"]:checked'
        );


    if (!selected) {

        return;

    }


    profileData.smokingTolerance =
        Number(
            selected.value
        );


    document.getElementById(
        "preferenceFinishButton"
    ).disabled = false;
}


// ========================================
// profileData -> matching.js 입력 형식 변환
// ========================================

function genderToEn(gender) {

    return gender === "남"
        ? "male"
        : "female";
}


function preferredGenderToArray(preferredGender) {

    if (preferredGender === "상관없음") {

        return ["male", "female"];

    }


    return [genderToEn(preferredGender)];
}


function calculateAge(birthDateStr) {

    const birth = new Date(birthDateStr);
    const today = new Date();

    let age =
        today.getFullYear()
        - birth.getFullYear();


    const beforeBirthday =
        today.getMonth() < birth.getMonth()
        ||
        (
            today.getMonth() === birth.getMonth()
            &&
            today.getDate() < birth.getDate()
        );


    if (beforeBirthday) {

        age -= 1;

    }


    return age;
}


function buildMyInput() {

    return {

        gender: genderToEn(profileData.gender),

        preferredGender:
            preferredGenderToArray(
                profileData.preferredGender
            ),

        age: calculateAge(profileData.birthDate),

        ageMin: profileData.preferredAgeMin,
        ageMax: profileData.preferredAgeMax,

        preferredDistricts: [

            profileData.regionFirst,
            profileData.regionSecond,
            profileData.regionThird

        ].filter(Boolean),

        isSmoking: profileData.smoking,
        smokingTolerance: profileData.smokingTolerance,

        sleepRange: [

            profileData.sleepStart,
            profileData.sleepEnd

        ],

        noiseLevel: profileData.noiseSensitivity,
        socialLevel: profileData.socialLevel,

        rentRange: [

            profileData.budgetMin,
            profileData.budgetMax

        ]

    };
}


// ========================================
// 추천 이유 문구
// ========================================

const REASON_LABELS = {

    smoking: "흡연 성향이 잘 맞아요.",
    sleep: "수면 시간대가 비슷해요.",
    social: "교류 희망 정도가 비슷해요.",
    noise: "소음 민감도가 비슷해요.",
    region: "희망 지역이 겹쳐요.",
    budget: "희망 예산이 비슷해요."

};


function buildReasons(breakdown) {

    return Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => REASON_LABELS[key]);
}


let matchResults = [];
let recommendationIndex = 0;


// ========================================
// 설문 완료
// ========================================

function finishSurvey() {

    console.log(
        "사용자 입력 데이터"
    );

    console.log(
        profileData
    );


    const myInput = buildMyInput();

    // 우선순위(1~3순위) 선택 화면이 아직 없어서 전 항목 동일 가중치로 계산.
    const priorities = [];

    let results =
        getMatches(myInput, priorities, seedUsers);


    // gender/age/region은 matching.js에서 항상 하드필터로 처리됨.
    // budget/stay는 matching.js가 소프트로만 처리하므로, 체크박스가
    // 켜져 있으면 여기서 추가로 걸러낸다.
    if (profileData.budgetHardFilter) {

        results =
            results.filter(
                (result) => result.breakdown.budget === 100
            );

    }


    if (profileData.stayHardFilter) {

        results =
            results.filter((result) => {

                const user =
                    seedUsersById.get(result.userId);

                return (
                    user.stayDuration >= profileData.stayMin
                    &&
                    user.stayDuration <= profileData.stayMax
                );

            });

    }


    matchResults = results;


    recommendationIndex = 0;


    renderRecommendation();


    goToPage(15);
}


// ========================================
// 추천 카드 출력
// ========================================

function renderRecommendation() {

    const profileCard =
        document.getElementById("profileCard");

    const arrows =
        document.querySelectorAll(".profile-arrow");


    if (matchResults.length === 0) {

        profileCard.style.display = "none";

        arrows.forEach((arrow) => {
            arrow.style.display = "none";
        });


        document.getElementById(
            "profileCounter"
        ).textContent =
            "조건에 맞는 추천 결과가 없어요";


        return;
    }


    profileCard.style.display = "";

    arrows.forEach((arrow) => {
        arrow.style.display = "";
    });


    const result =
        matchResults[recommendationIndex];

    const user =
        seedUsersById.get(result.userId);


    document.getElementById(
        "cardName"
    ).textContent =
        user.name;


    document.getElementById(
        "cardBasicInfo"
    ).textContent =
        `${user.gender === "male" ? "남성" : "여성"} · ${user.age}세`;


    document.getElementById(
        "cardScore"
    ).textContent =
        result.finalScore;


    document.getElementById(
        "matchProgressFill"
    ).style.width =
        `${result.finalScore}%`;


    document.getElementById(
        "cardRegion"
    ).textContent =
        user.preferredDistricts.join(" · ");


    document.getElementById(
        "cardBudget"
    ).textContent =
        `${user.rentRange[0]}~${user.rentRange[1]}만원`;


    document.getElementById(
        "cardStay"
    ).textContent =
        formatStay(user.stayDuration);


    document.getElementById(
        "cardSocial"
    ).textContent =
        `${user.socialLevel} / 5`;


    document.getElementById(
        "cardNoise"
    ).textContent =
        `${user.noiseLevel} / 5`;


    document.getElementById(
        "cardSmoking"
    ).textContent =
        user.isSmoking ? "흡연" : "비흡연";


    const reasonList =
        document.getElementById(
            "cardReasons"
        );


    reasonList.innerHTML = "";


    buildReasons(result.breakdown).forEach(
        (reason) => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                reason;


            reasonList.appendChild(
                li
            );

        }
    );


    document.getElementById(
        "profileCounter"
    ).textContent =
        `${recommendationIndex + 1} / ${matchResults.length}`;
}


// ========================================
// 추천 다음
// ========================================

function nextRecommendation() {

    recommendationIndex++;


    if (
        recommendationIndex
        >= matchResults.length
    ) {

        recommendationIndex = 0;

    }


    renderRecommendation();
}


// ========================================
// 추천 이전
// ========================================

function previousRecommendation() {

    recommendationIndex--;


    if (
        recommendationIndex < 0
    ) {

        recommendationIndex =
            matchResults.length
            - 1;

    }


    renderRecommendation();
}


// ========================================
// 초기 실행
// ========================================

createRegionOptions();

updateStayRange();

updateBudgetRange();

updateAgeRange();


// type="module"에서는 함수가 자동으로 window에 노출되지 않으므로,
// index.html의 inline onclick/onchange 핸들러가 찾을 수 있도록 명시적으로 등록.
Object.assign(window, {

    goToPage,
    selectGender,
    validateBirthDate,
    validateRegions,
    validateSocial,
    validateNoise,
    updateSleepTime,
    selectSmoking,
    selectPreferredGender,
    validateSmokingPreference,
    finishSurvey,
    previousRecommendation,
    nextRecommendation

});