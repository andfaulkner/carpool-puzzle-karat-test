// Ensure environment knows testing is occurring.
(process.env as any).mocha = true;

/*------------------------------------- THIRD-PARTY IMPORTS --------------------------------------*/
// Testing modules
import "mocha";
import { expect, assert } from "chai";

/*-------------------------------- IMPORT FILE TO TEST + TYPINGS ---------------------------------*/
import { carpool } from "../carpool-puzzle";
import type { Person, Road } from "../carpool-puzzle";

/*------------------------------------------ MOCK DATA -------------------------------------------*/
//
// EXAMPLE ONE
//
/** Stores roadmap: a graph data array listing locations connected by each road & their lengths */
const roads1: Road[] = [
    ["Bridgewater", "Caledonia", "30"],
    ["Caledonia", "New Grafton", "15"],
    ["New Grafton", "Campground", "5"],
    ["Liverpool", "Milton", "10"],
    ["Milton", "New Grafton", "30"],
];

/** Vehicle starting points */
const starts1 = ["Bridgewater", "Liverpool"];

/** Locations of people to pick up */
const people1: Person[] = [
    ["Jessie", "Bridgewater"],
    ["Travis", "Caledonia"],
    ["Jeremy", "New Grafton"],
    ["Katie", "Liverpool"],
];

//
// EXAMPLE TWO
//
const roads2: Road[] = [
    ["Riverport", "Chester", "40"],
    ["Chester", "Campground", "60"],
    ["Halifax", "Chester", "40"],
];
const starts2 = ["Riverport", "Halifax"];
const people2: Person[] = [
    ["Colin", "Riverport"],
    ["Sam", "Chester"],
    ["Alyssa", "Halifax"],
];

//
// EXAMPLE THREE
//
const roads3: Road[] = [
    ["Riverport", "Bridgewater", "1"],
    ["Bridgewater", "Liverpool", "1"],
    ["Liverpool", "Campground", "1"],
];
const starts3_1 = ["Riverport", "Bridgewater"];
const starts3_2 = ["Bridgewater", "Riverport"];
const starts3_3 = ["Riverport", "Liverpool"];
const people3: Person[] = [
    ["Colin", "Riverport"],
    ["Jessie", "Bridgewater"],
    ["Sam", "Liverpool"],
];

/*------------------------------------------- HELPERS --------------------------------------------*/
/**
 * Check if the 2 arrays contain the exact same elements (and number of elements),
 * with no concern for the order they appear in.
 */
const uArrsEql = (arr1: string[], arr2: string[]) => {
    const arr1Sorted = [...arr1].sort();
    const arr2Sorted = [...arr2].sort();
    return (
        arr1.length === arr2.length &&
        arr1Sorted.every((val, idx) => val === arr2Sorted[idx])
    );
};

/**
 * Confirm that the expected car and actual car contents match.
 * Ignores car order, and order of people in each car.
 */
const carsMatch = (actual: string[][], expected: string[][]) =>
    (uArrsEql(actual[0], expected[0]) && uArrsEql(actual[1], expected[1])) ||
    (uArrsEql(actual[0], expected[1]) && uArrsEql(actual[1], expected[0]));

const expectTrue = (val: boolean) => expect(val).to.be.true;
const expectFalse = (val: boolean) => expect(val).to.be.false;

/**---------------  HELPER TESTS ---------------*/
describe(`carsMatch test helper (Returns true given 2 arrays of arrays w the same vals, in any order)`, function() {
    // prettier-ignore
    it('should work for comparing all orders of large equal-length arrays', function() {
        expectTrue(carsMatch([["Jess", "Travs"], ["Kat", "J"]], [["Jess", "Travs"], ["Kat", "J"]]));
        expectTrue(carsMatch([["Travs", "Jess"], ["Kat", "J"]], [["Jess", "Travs"], ["Kat", "J"]]));
        expectTrue(carsMatch([["Kat", "J"], ["Jess", "Travs"]], [["Jess", "Travs"], ["Kat", "J"]]));
        expectTrue(carsMatch([["Kat", "J"], ["Travs", "Jess"]], [["Jess", "Travs"], ["Kat", "J"]]));
        expectTrue(carsMatch([["J", "Kat"], ["Jess", "Travs"]], [["Jess", "Travs"], ["Kat", "J"]]));
        expectTrue(carsMatch([["J", "Kat"], ["Travs", "Jess"]], [["Jess", "Travs"], ["Kat", "J"]]));
    });

    // prettier-ignore
    it('should work for comparing different length child arrays', function() {
        expectTrue(carsMatch([["Cole", "Sam"], ["Aly"]], [["Cole", "Sam"], ["Aly"]]));
        expectTrue(carsMatch([["Cole", "Sam"], ["Aly"]], [["Sam", "Cole"], ["Aly"]]));
        expectTrue(carsMatch([["Cole", "Sam"], ["Aly"]], [["Aly"], ["Cole", "Sam"]]));
        expectTrue(carsMatch([["Cole", "Sam"], ["Aly"]], [["Aly"], ["Sam", "Cole"]]));
    });

    it("should work for comparing arrays where 1 or both of the nested arrays are empty ", function() {
        expectTrue(carsMatch([[], []], [[], []]));
        expectTrue(carsMatch([["Travis"], []], [["Travis"], []]));
        expectTrue(carsMatch([["Travis"], []], [[], ["Travis"]]));
    });

    it("should fail when given non-matching arrays", function() {
        expectFalse(carsMatch([[], []], [[], ["Aly"]]));
        expectFalse(carsMatch([[], []], [["Sam"], ["Aly"]]));
        expectFalse(carsMatch([[], []], [["Cole", "Sam"], ["Aly"]]));
        expectFalse(carsMatch([[], ["Aly"]], [["Cole", "Sam"], ["Aly"]]));
        expectFalse(carsMatch([["Sam"], ["Aly"]], [["Cole", "Sam"], ["Aly"]]));
    });
});

/*-------------------------------------------- TESTS ---------------------------------------------*/
describe("carpool function", function () {
    let ex1Res: ReturnType<typeof carpool>;
    let ex2Res: ReturnType<typeof carpool>;
    let ex3p1Res: ReturnType<typeof carpool>;
    let ex3p2Res: ReturnType<typeof carpool>;
    let ex3p3Res: ReturnType<typeof carpool>;

    before(() => {
        ex1Res = carpool(roads1, starts1, people1);
        ex2Res = carpool(roads2, starts2, people2);
        ex3p1Res = carpool(roads3, starts3_1, people3);
        ex3p2Res = carpool(roads3, starts3_2, people3);
        ex3p3Res = carpool(roads3, starts3_3, people3);
    });

    it("Gives the expected result for example 1", function () {
        expectTrue(carsMatch(ex1Res, [["Jessie", "Travis"], ["Katie", "Jeremy"]])); // prettier-ignore
    });

    it("Gives the expected result for example 2", function () {
        expectTrue(carsMatch(ex2Res, [["Colin", "Sam"], ["Alyssa"]]));
    });

    it("Gives the expected results for example 3", function () {
        expectTrue(carsMatch(ex3p1Res, [["Colin"], ["Jessie", "Sam"]]));
        expectTrue(carsMatch(ex3p2Res, [["Jessie", "Sam"], ["Colin"]]));
        expectTrue(carsMatch(ex3p3Res, [["Jessie", "Colin"], ["Sam"]]));
    });

    it("Fails when given non-matching arrays", function () {
        expectTrue(carsMatch(ex3p1Res, [["Colin"], ["Jessie", "Sam"]]));
        expectTrue(carsMatch(ex3p2Res, [["Jessie", "Sam"], ["Colin"]]));
        expectTrue(carsMatch(ex3p3Res, [["Jessie", "Colin"], ["Sam"]]));
    });
});
