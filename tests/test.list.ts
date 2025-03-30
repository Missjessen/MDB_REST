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
    //beforeEach clear test database
    test.beforeEach(async () => {
        try {
            await connect();
            await userModel.deleteMany({});
            await productModel.deleteMany({});
            } 
            finally {
                await disconnect();
            }
    }
    );
}
test.afterAll(async () => {
    try {
        await connect();
        await userModel.deleteMany({});
        await productModel.deleteMany({});
        } 
        finally {
            await disconnect();
        }
}
);

setup();

test.describe(health);
test.describe(userTestCollection);
test.describe(eventTestCollection);

