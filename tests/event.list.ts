process.env.NODE_ENV = 'test';

import { test, expect } from '@playwright/test';

// create event
export function createEventCollection() {
    test("Create event", async ({ request }) => {
        test.setTimeout(10_000);

        // arrange
        const event = {
            title: "Vue.js Meetup",
            date: "2025-03-15T18:00:00.000Z",
            eventlocation: "Copenhagen, Denmark",
            description: "Lær om Vue.js og mød andre udviklere!",
            maxAttendees: 50,
            attendees: [],
            createdBy: "user123"
        };

        const response = await request.post("/api/event/create", { data: event });
        const json = await response.json();

        expect(response.status()).toBe(201);
        expect(json.error).toBeNull();
    });
}

export function eventTestCollection() {
    test("Get all events", async ({ request }) => {
        test.setTimeout(10_000);

        const response = await request.get("/api/event/all");
        const json = await response.json();

        expect(response.status()).toBe(200);
        expect(json.error).toBeNull();
    });
}



