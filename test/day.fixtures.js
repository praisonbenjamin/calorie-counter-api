function makeDayArray() {
    return [
        {
            id: 1,
            day_title: 'One'
        },
        {
            id: 2,
            day_title: 'Two'
        },
        {
            id: 3,
            day_title: 'Three'
        }
    ];
}

function makeMaliciousImgDay() {
    const maliciousImgDay = {
        id: 911,
        day_title: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    };
    const expectedImgDay = {
        ...maliciousImgDay,
        day_title: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };

    return {
        maliciousImgDay, expectedImgDay
    }
}

module.exports = {
    makeDayArray,
    makeMaliciousImgDay
};