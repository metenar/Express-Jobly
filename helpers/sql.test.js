const { sqlForPartialUpdate }=require('./sql');
const { BadRequestError } = require("../expressError");

describe('test for providing data for sql patch query',()=>{
    test('testing the correct data format',()=>{
        let data={firstName:'Test1',lastName:'Test_Last_Name'};
        let sqlVar={firstName:'first_name',lastName:'last_name'};
        let {setCols,values}=sqlForPartialUpdate(data,sqlVar);
        expect(setCols).toEqual(`"first_name"=$1, "last_name"=$2`);
        expect(values).toEqual(['Test1','Test_Last_Name']);
    })
    test('respons with BadRequestError with no data',()=>{
        let data={};
        let sqlVar={firstName:'first_name',lastName:'last_name'};
        try{
            let {setCols,values}=sqlForPartialUpdate(data,sqlVar);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
          }
    })
})