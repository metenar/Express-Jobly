const { BadRequestError } = require("../expressError");

/** This Partialy update the user with the given
 *
 * DataToUpdate can be:
 *   for user calls { firstName, lastName, password, email }
 *   for company calls {name, description, numEmployees, logoUrl}
 *   for job calls {title, salary, equity, company_handle}
 * jsToSql is for change the js variable names to SQl Col names
 *
 * Returns { the array of paremeterized query variables like "first_name"=$1', '"age"=$2
 * in a single string using join of the array
 * and the values of DataToUpdate }
 *
 **/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // if the keys length is 0 that means there is no data to update so we throw an error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
