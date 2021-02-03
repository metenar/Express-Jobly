"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */
  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(`
    INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
            title,
            salary,
            equity,
            company_handle,
        ]
    );
    const jobs = result.rows[0];

    return jobs;
  }
/** Find all jobs.
   * If no queries included shows all jobs if title, 
   * minSalary or hasEquity(true or false) queries included then it 
   * filters the result acording to the queries provided.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   *           
   * */

  static async findAll(data) {
      if (data.hasEquity===2){
        const jobsRes = await db.query(
            `SELECT id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
            FROM jobs WHERE title ILIKE $1 AND 
            salary >= $2
            ORDER BY id`,[data.title,data.minSalary]);
        return jobsRes.rows;
      } else {
          const jobsRes = await db.query(
              `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
              FROM jobs WHERE title ILIKE $1 AND 
              salary >= $2 AND equity> $3
              ORDER BY id`,[data.title,data.minSalary,data.hasEquity]);
        return jobsRes.rows;
        } 
  }

  /** Given a jobs id, return data about jobs.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity:"equity",
          companyHandle:'company_handle'
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }
}


module.exports = Job;

