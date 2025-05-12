
function lightedAreaTop() {
    let firstDigit = Math.floor(lampLocation.downLeft / 10);
    let lastDigit = lampLocation.downLeft % 10;
    let area = lightedArea().left;
    let verEdge = (Math.floor(area[area.length - 1] / 10) + 1) - firstDigit;
    let topArea = [];

    for (let i = 0; i < area.length; i++) {
        const first = Math.floor(area[i] / 10);
        const last = area[i] % 10;

        let exclude = false;
        for (let offset = 0; offset <= verEdge - 1; offset++) {
            if (first > firstDigit + offset && last === lastDigit - offset) {
                exclude = true;
                break;
            }
        }
        if (!exclude) {
            topArea.push(area[i]);
        }
    }
    return topArea;
}

function coverLocations() {
    let coverLocations = {};

    obstacleLocations.forEach((obstacle, index) => {
        const isConsecutive = index > 0 && obstacleLocations[index - 1] === obstacle - 1;

        if (lightedAreaTop().includes(obstacle)) {
            if (!isConsecutive) {
                coverLocations[obstacle - 1] = "west";
            }
        } else {
            if (!isConsecutive) {
                coverLocations[obstacle - 1] = "west";
            }
            coverLocations[obstacle + levelSize] = "south";
            coverLocations[obstacle + levelSize - 1] = "southwest";
        }
    });
    return coverLocations;
}

function spotlightOnOff() {
    //let light = 'rgba(255,255,111,0.8)';
    if (spotlight == null) {
        setSpotlight(light);
    } else if (spotlight == light) {
        setSpotlight(null);
    }
}