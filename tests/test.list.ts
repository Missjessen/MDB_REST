process.env.NODE_ENV = 'test';

import { test } from "@playwright/test";
import health from "./health.test";
import userTestCollection from "./user.test";
import eventTestCollection from "./event.list";

import { userModel } from "../src/models/userModel";
import { productModel } from "../src/models/productsModel";
import { eventModel } from "../src/models/eventModel";

import dotenvFlow from "dotenv-flow";
import { connect, disconnect } from "../src/repository/database";

dotenvFlow.config();

async function clearDatabase() {
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await eventModel.deleteMany({});
}

function setup() {
    // Ryd testdatabasen før hver test
    test.beforeEach(async () => {
        try {
            await connect();
            await clearDatabase();  
        } finally {
            await disconnect();
        }
    });

    // Ryd testdatabasen efter alle tests
    test.afterAll(async () => {
        try {
            await connect();
            await clearDatabase(); 
        } finally {
            await disconnect();
        }
    });
}

setup();

test.describe("Health Tests", health);
test.describe("User Tests", userTestCollection);
test.describe("Event Tests", eventTestCollection);
