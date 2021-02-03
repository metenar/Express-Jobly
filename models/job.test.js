"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "NewJob",
    salary: 100,
    equity: 0,
    company_handle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        'id':expect.any(Number),
        'title':"NewJob",
        'salary': 100,
        'equity': '0',
        'companyHandle': "c1"
    });

    const result = await db.query(
          `SELECT title,salary,equity,company_handle
           FROM jobs
           WHERE title = 'NewJob'`);
    expect(result.rows).toEqual([
      {
        title: "NewJob",
        salary: 100,
        equity: '0',
        company_handle: "c1"
      }
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
    // With this data configuration it works as a no filter
    let noFilterData={
        title:'%',
        hasEquity:2,
        minSalary:0
    }
    // With this data configuration it works with filter
    let filterData={
        title:'%j%',
        hasEquity:0,
        minSalary:2000 
    }
  test("works: no filter", async function () {
    let jobs = await Job.findAll(noFilterData);
    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 1000,
        equity: '0',
        companyHandle: "c1"
      },
      {
        id: 2,
        title: "j2",
        salary: 2000,
        equity: '0.24',
        companyHandle: "c2"
      },
      {
        id: 3,
        title: "j3",
        salary: 3000,
        equity: '0.12',
        companyHandle: "c3",
      },
    ]);
  });
  test("works: With filter", async function () {
    let jobs = await Job.findAll(filterData);
    expect(jobs).toEqual([
        {
            id: 2,
            title: "j2",
            salary: 2000,
            equity: '0.24',
            companyHandle: "c2"
          },
        {
            id: 3,
            title: "j3",
            salary: 3000,
            equity: '0.12',
            companyHandle: "c3",
        }
    ]);
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        id: 1,
        title: "j1",
        salary: 1000,
        equity: '0',
        companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "NewJob",
    salary: 1500,
    equity: '0.12',
    companyHandle: 'c2',
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id:1,
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
        //    console.log(result.rows)
    expect(result.rows).toEqual([{
      id: 1,
      title: "NewJob",
      salary: 1500,
      equity: '0.12',
      company_handle: "c2",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "NewJob",
      salary: null,
      equity: null,
      companyHandle: 'c2',
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "NewJob",
      salary: null,
      equity: null,
      company_handle: 'c2',
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(99, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
