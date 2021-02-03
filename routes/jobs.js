"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id,title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { id,title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity(true or false)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    let data={};
    // Check if req.query has minSalary data if yes add to data object
    // Else to get all jobs we add data object as 0
    if (req.query.minSalary){
      let minSalary=req.query.minSalary;
      data.minSalary=minSalary;
    } else data.minSalary=0;
    // Check if req.query hasEquity === true add to data object same key 
    // with the value of 0
    // Else to get all jobs we add data object as "2" whe check this data
    // in the models/job.js
    if (req.query.hasEquity===true){
      data.hasEquity=0
    } else data.hasEquity=2;
    // Check if req.query has title data if yes add to data object
    // Else to get all jobs we add data object as '%'
    if(req.query.title){
      let title=req.query.title;
      data.title=`%${title}%`
    } else data.title='%'
    // Check the data of data object and compare the minEmployee and maxEmployee
    // if minEmployee amount is bigger then maxEmployee amount then throw new 
    // BadRequestError with the appropriate message.
    const jobs = await Job.findAll(data);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id,title, salary, equity, companyHandle}
 * 
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { cob }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id,title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
