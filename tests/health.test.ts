import {test, expect} from '@playwright/test';

export default function health() {
   /*  test("health check", async ({ request }) => {
        const response = await request.get("/api/");
        const text = await response.text();
        expect(response.status()).toBe(200);
        expect(text).toBe('Welcome to the THIS API');
    });
        } */

    
        test("health check", async ({ request }) => {
            const response = await request.get("/api/");
            const json = await response.json();
            expect(response.status()).toBe(20);
            expect(json).toEqual({ message: 'Welcome to the THIS API' });
        }); 
    }
       