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
        convertShiftedTime(
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


function convertShiftedTime(
    hour,
    minute
) {

    return (
        (hour + 12) % 24
    )
    +
    minute / 60;
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
// 추천 테스트 데이터
// 백엔드 통합 전 UI 확인용
// ========================================

const recommendationProfiles = [

    {
        name: "김민수",

        gender: "남성",

        age: 22,

        score: 92,

        region: "성북구",

        budget: "50~70만원",

        stay: "6~12개월",

        social: "4 / 5",

        noise: "2 / 5",

        smoking: "비흡연",

        reasons: [

            "희망 지역이 겹쳐요.",

            "생활 패턴이 비슷해요.",

            "교류 성향이 잘 맞아요."

        ]
    },


    {
        name: "임도현",

        gender: "남성",

        age: 23,

        score: 86,

        region: "성북구",

        budget: "55~75만원",

        stay: "6~18개월",

        social: "3 / 5",

        noise: "2 / 5",

        smoking: "비흡연",

        reasons: [

            "희망 예산 범위가 비슷해요.",

            "소음에 대한 성향이 비슷해요.",

            "수면 시간이 비슷해요."

        ]
    },


    {
        name: "한예진",

        gender: "여성",

        age: 24,

        score: 79,

        region: "광진구",

        budget: "60~85만원",

        stay: "6~18개월",

        social: "3 / 5",

        noise: "3 / 5",

        smoking: "비흡연",

        reasons: [

            "거주 희망 기간이 겹쳐요.",

            "교류 성향 차이가 크지 않아요.",

            "흡연 조건이 잘 맞아요."

        ]
    }

];


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


    recommendationIndex = 0;


    renderRecommendation();


    goToPage(15);
}


// ========================================
// 추천 카드 출력
// ========================================

function renderRecommendation() {

    const profile =
        recommendationProfiles[
            recommendationIndex
        ];


    document.getElementById(
        "cardName"
    ).textContent =
        profile.name;


    document.getElementById(
        "cardBasicInfo"
    ).textContent =
        `${profile.gender} · ${profile.age}세`;


    document.getElementById(
        "cardScore"
    ).textContent =
        profile.score;


    document.getElementById(
        "matchProgressFill"
    ).style.width =
        `${profile.score}%`;


    document.getElementById(
        "cardRegion"
    ).textContent =
        profile.region;


    document.getElementById(
        "cardBudget"
    ).textContent =
        profile.budget;


    document.getElementById(
        "cardStay"
    ).textContent =
        profile.stay;


    document.getElementById(
        "cardSocial"
    ).textContent =
        profile.social;


    document.getElementById(
        "cardNoise"
    ).textContent =
        profile.noise;


    document.getElementById(
        "cardSmoking"
    ).textContent =
        profile.smoking;


    const reasonList =
        document.getElementById(
            "cardReasons"
        );


    reasonList.innerHTML = "";


    profile.reasons.forEach(
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
        `${recommendationIndex + 1} / ${recommendationProfiles.length}`;
}


// ========================================
// 추천 다음
// ========================================

function nextRecommendation() {

    recommendationIndex++;


    if (
        recommendationIndex
        >= recommendationProfiles.length
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
            recommendationProfiles.length
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