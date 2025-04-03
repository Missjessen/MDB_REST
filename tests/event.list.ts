import { test, expect } from "@playwright/test";

export default function eventTestCollection() {

    test("Workflow - register, login, create event and verify", async ({ request }) => {

        test.setTimeout(30_000);

        //------------------------------------------------------------------------------
        // Create test objects
        //------------------------------------------------------------------------------
        const userReg = {
            name: "Lars Larsen",
            email: "mail@larsen.com",
            password: "12345678"
        };

        const userLogin = {
            email: "mail@larsen.com",
            password: "12345678"
        };

        //------------------------------------------------------------------------------
        // Register user
        //------------------------------------------------------------------------------
        let response = await request.post("/api/user/register", { data: userReg });
        let json = await response.json();
        expect(response.status()).toBe(201);

        //------------------------------------------------------------------------------
        // Login user
        //------------------------------------------------------------------------------
        response = await request.post("/api/user/login", { data: userLogin });
        json = await response.json();


        const token = json?.data?.token;
        const userId = json?.data?.userId;

        // Check if token exists
        if (!token) {
            throw new Error("Login failed: No token received.");
        }

        expect(response.status()).toBe(200);

        //------------------------------------------------------------------------------
        // Create event
        //------------------------------------------------------------------------------
        const event = {
            title: "Vue.js Meetup",
            date: "2025-03-15T18:00:00.000Z",
            eventlocation: "Copenhagen, Denmark",
            description: "Lær om Vue.js og mød andre udviklere!",
            maxAttendees: 50,
            attendees: [],
            createdBy: userId
        };

        response = await request.post("/api/events", {
            headers: {
                "auth-token": token,  // Inkluder token i headeren
                "Content-Type": "application/json"
            },
            data: JSON.stringify(event)
        });

        //console.log("Event Creation Response:", await response.text());

        expect(response.status()).toBe(201);

        //------------------------------------------------------------------------------
        // Verify event
        //------------------------------------------------------------------------------
        response = await request.get("/api/events", {
            headers: {
                "auth-token": token  // Inkluder token ved hentning
            }
        });
        json = await response.json();

        // Log hentede events for debugging
        //console.log("Events:", json);

        const receivedEvent = json[0];
        expect(receivedEvent.title).toEqual(event.title);
        expect(receivedEvent.description).toEqual(event.description);
        expect(json).toHaveLength(1);
    });
}
