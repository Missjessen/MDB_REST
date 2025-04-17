// tests/sheets.test.ts
jest.mock('googleapis');              // ← sig til Jest at hente din __mocks__/googleapis.ts
import request from 'supertest';
import app from '../src/app';     // din Express‑app

describe('🗒️ Sheets‑API', () => {
  let jwt: string;

  beforeAll(async () => {
    // Hvis du ikke vil køre det fulde Google OAuth, kan du stubbe login
    const res = await request(app)
      .post('/api/google/callback')
      .send({ /* kode eller direkte token‑stub */ });
    jwt = res.body.token;
  });

  it('POST /api/google/create-sheet → 200 + sheetLink', async () => {
    const res = await request(app)
      .post('/api/google/create-sheet')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.sheetId).toBe('string');
    expect(res.body.sheetLink).toMatch(/^https:\/\/docs\.google\.com\/spreadsheets\/d\//);
  });

  it('POST /api/google/sync-sheet/:userId → 200 + result-array', async () => {
    const userId = '000000000000000000000000'; // en gyldig ObjectId‑stub
    const res = await request(app)
      .post(`/api/google/sync-sheet/${userId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);
  });
});
