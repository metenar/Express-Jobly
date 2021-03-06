"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "j4",
    salary: 4000,
    equity: '0.5',
    company_handle: 'c3',
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
            id:expect.any(Number),
            title: "j4",
            salary: 4000,
            equity: '0.5',
            companyHandle: 'c3',
          }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 10000,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("With empty queries ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 1000,
              equity: '0',
              companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 2000,
                equity: '0.24',
                companyHandle: "c2"
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 3000,
                equity: '0.12',
                companyHandle: "c3"
            }
          ]
    });
  });
  test("Get jobs With queries", async function () {
    const resp = await request(app).get("/jobs?title=%3%");
    expect(resp.body).toEqual({
      jobs:
          [{
            id: expect.any(Number),
            title: "j3",
            salary: 3000,
            equity: '0.12',
            companyHandle: "c3"
          }]
    });
  });
  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 1000,
        equity: '0',
        companyHandle: "c1"
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/99999999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1-new",
        salary: 1000,
        equity: '0',
        companyHandle: "c1"
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/99999999`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 999999999
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: "nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: '1' });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/99999999`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
