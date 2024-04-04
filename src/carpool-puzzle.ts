/*--------------------------------------- TYPE DEFINITIONS ---------------------------------------*/
/**
 * Format: [Origin, Destination, Duration in string form]
 * Example: ["Bridgewater", "Caledonia", "30"]
 */
export type Road = [string, string, string];

/**
 * Format: [Name, Location]
 * Example: ["Colin", "Riverport"]
 */
export type Person = [string, string];

/** e.g. [Chester, 40] */
type Location = [string, number];

/**
 * e.g.:
 *    {Riverport: [Chester,    40],
 *     Chester:   [Campground, 60],
 *     Halifax:   [Chester,    40]}
 */
type Roadmap = Record<string, Location>

/*------------------------------------------- HELPERS --------------------------------------------*/
/**
 * Concisely detect if the given [value] is a number.
 */
const isNumber = (value: any): value is number => typeof value === 'number';

/**
 * Get cumulative travel time for each location given a start location.
 *
 * Example result for a given start location:
 *     {Riverport:  { time: 0,  cTime: 0   },
 *      Chester:    { time: 40, cTime: 40  },
 *      Campground: { time: 60, cTime: 100 }}
 *
 * @return {[string, {time: number, cTime: number}][]} Array of arrays containing location info w/
 *                                                     cumulative time calculated for each.
 */
const calcCumulativeTimeRoadmap = (roadmap: Roadmap, start: string) => {
    let curRoad = start;
    let curTime = 0;
    let carPath: [string, {time: number, cTime: number}][] = [[curRoad, {time: 0, cTime: 0}]];

    while(curRoad !== 'Campground') {
        const nextRoad = roadmap[curRoad];
        const [nextLocation, time] = nextRoad;

        curTime = carPath[carPath.length - 1][1].cTime + time;
        carPath.push([nextLocation, {time, cTime: curTime}]);
        curRoad = nextLocation;
    }

    const timeToLocationData = carPath.reduce((acc, locationData) => {
        acc[locationData[0]] = locationData[1];
        return acc;
    }, {} as Record<string, {time: number, cTime: number}>)

    return timeToLocationData;
};

/*-------------------------------------------- EXPORT --------------------------------------------*/
/**
 * Calculate who should go in what car for a trip for a trip to the campground.
 * See carpool-puzzle-doc.md for more details.
 */
export const carpool = (
    roads: Road[],
    starts: string[],
    people: Person[],
): string[][] => {
    /**
     * Create roadmap object linking each location to the next location and distance to it.
     * Format: {START_LOCATION: {DESTINATION: DISTANCE}, ...}
     *
     * Example:
     *    {
     *        Riverport: [ Chester,    40 ],
     *        Chester:   [ Campground, 60 ],
     *        Halifax:   [ Chester,    40 ]
     *    }
     */
    const roadmap: Roadmap = roads.reduce((acc, road: Road) => {
        const [dest1, dest2, distance] = road;
        acc[dest1] = [dest2, parseInt(distance)];
        return acc;
    }, {} as Roadmap);

    //
    // Calculate cumulative time to reach each destination on the path, for each vehicle.
    //
    const [car1Start, car2Start] = starts;

    const car1Times = calcCumulativeTimeRoadmap(roadmap, car1Start);
    const car2Times = calcCumulativeTimeRoadmap(roadmap, car2Start);

    // Collections of people in each car.
    const car1People = [];
    const car2People = [];

    //
    // Determine what car each person should go in, by placing them in whichever of the
    // 2 vehicles arrives at the location the soonest (using the cumulative time data
    // calculated for each vehicle in the previous step).
    //
    for (const [name, waitingLocation] of people) {
        const car1Time = car1Times[waitingLocation]?.cTime;
        const car2Time = car2Times[waitingLocation]?.cTime;

        if (isNumber(car1Time) && !isNumber(car2Time)) car1People.push(name);
        else if (isNumber(car2Time) && !isNumber(car1Time)) car2People.push(name);
        else if (car1Time <= car2Time) car1People.push(name);
        else car2People.push(name);
    }

    console.log(`car1People:`, car1People);
    console.log(`car2People:`, car2People);

    return [car1People, car2People];
};
