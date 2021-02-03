# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

## Application usage

   This Application is kind of lightweight of LinkedIn.
   
### The non register user can:

    - Retrieving the list of companies or information about a company
    - Filter the company (name,minEmployee,maxEmployee)
    - Get the job list
    - Filters the job (title,minSalary,hasEquity)
    - Register

### The registered user can (in adition):

    - Getting information on a user
    - Updating of that user 
    - Deleting the user
    - Apply on a job
  
### The admin user can (in adition):

    - Creating a company
    - Updating companies 
    - Deleting the company
    - Creating user
    - Getting the list of all users
    - Adding job
    - Updating a job
    - Delete the job
    