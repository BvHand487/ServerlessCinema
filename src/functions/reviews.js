const { app } = require('@azure/functions');
const sql = require('mssql');
const { CONN_STRING } = require('../db/config.js');
const utils = require('../utils/utils.js');

app.http('reviews', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (req, ctx) => {
        
        try
        {
            await sql.connect(CONN_STRING);
        }
        catch (err)
        {
            ctx.log('An error occured with the sql database.');
            ctx.log(err);
        }

        switch (req.method)
        {
            case 'GET':

                let matchedReviews;

                // For a title, fetch reviews for best matched film
                if (req.query.has('title'))
                {
                    ctx.log('[GET] Searching reviews by title');
                    matchedReviews = await sql.query(`SELECT Ratings.id, review, rating, date, author FROM Ratings LEFT JOIN Movies ON Ratings.movie_id = Movies.id WHERE Movies.title = (SELECT TOP 1 title FROM Movies WHERE DIFFERENCE(\'${req.query.get('title')}\', title) >= 1 ORDER BY DIFFERENCE(\'${req.query.get('title')}\', title) DESC)`);
                }

                await sql.close();
                return {
                    status: 200,
                    jsonBody: matchedReviews.recordset,
                };


            case 'POST':

                if (!utils.containsAll(Array.from(req.query.keys()), ['title', 'review', 'rating', 'date', 'author']))
                {
                    await sql.close();

                    return {
                        status: 400,
                        jsonBody: [],
                    }
                }

                ctx.log('[POST] Uploading a review.');

                const request = new sql.Request();

                const bestMatchedMovie = await request.query(`SELECT TOP 1 id FROM Movies WHERE DIFFERENCE(\'${req.query.get('title')}\', title) >= 1 ORDER BY DIFFERENCE(\'${req.query.get('title')}\', title) DESC`);

                request.input('movie_id', sql.Int, bestMatchedMovie.recordset[0].id);
                request.input('review', sql.VarChar(512), req.query.get('review'));
                request.input('rating', sql.Int, req.query.get('rating'));
                request.input('date', sql.Date, req.query.get('date'));
                request.input('author', sql.VarChar(64), req.query.get('author'));

                const response = await request.query('INSERT INTO Ratings (movie_id, review, rating, date, author) VALUES (@movie_id, @review, @rating, @date, @author  );');

                await sql.close();

                return {
                    status: 200,
                    jsonBody: response.recordset,
                };


            default:
                cxt.log(`Unexpected http method -> ${req.method}`);

                await sql.close();

                return {
                    status: 405,
                    jsonBody: [], 
                };
        }
    }
});
