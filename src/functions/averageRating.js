const { app } = require('@azure/functions');
const sql = require('mssql');
const { CONN_STRING } = require('../db/config.js');


app.timer('averageRating', {
    schedule: '0 30 11 * * *',
    handler: async (myTimer, ctx) => {
        try
        {
            await sql.connect(CONN_STRING);

            await sql.query('UPDATE dbo.Movies SET average_rating = (SELECT AVG(CAST(rating as FLOAT)) FROM dbo.Ratings WHERE Movies.id = Ratings.movie_id)');

            await sql.close();

            ctx.log('Timer function processed request.');
        }
        catch (err)
        {
            ctx.log('An error occured with the sql database.');
            ctx.log(err);
        }

        context.extraOutputs.set(sqlOutput);
    }
});
