const { app } = require('@azure/functions');
const sql = require('mssql');
const { CONN_STRING } = require('../db/config.js');
const md5 = require('js-md5');
require('../utils/utils.js');


app.http('movies', {
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

                let matchedMovies;

                // If title is given, fetch the 10 best matches
                if (req.query.has('title'))
                {
                    ctx.log('[GET] Searching movies by title.');
                    matchedMovies = await sql.query(`SELECT TOP 10 * FROM dbo.Movies WHERE DIFFERENCE(\'${req.query.get('title')}\', title) >= 1 ORDER BY DIFFERENCE(\'${req.query.get('title')}\', title) DESC;`);
                }

                // Otherwise fetch 100 of the best rated movies.
                else
                {
                    ctx.log('[GET] Searching movies by avg rating.');
                    matchedMovies = await sql.query(`SELECT TOP 100 * FROM dbo.Movies ORDER BY average_rating DESC;`);
                }

                await sql.close();
                return {
                    status: 200,
                    jsonBody: matchedMovies.recordset,
                };


            case 'POST':
                
                if (!utils.containsAll(Array.from(req.query.keys()), ['title', 'year', 'genre', 'description', 'director', 'actors', 'soundtrack', 'thumbnail']))
                {
                    await sql.close();

                    return {
                        status: 400,
                        jsonBody: [],
                    }
                }

                ctx.log('[POST] Uploading a movie.');

                const request = new sql.Request();

                request.input('title', sql.VarChar(64), req.query.get('title'));
                request.input('year', sql.Int, req.query.get('year'));
                request.input('genre', sql.VarChar(64), req.query.get('genre'));
                request.input('description', sql.VarChar(512), req.query.get('description'));
                request.input('director', sql.VarChar(64), req.query.get('director'));
                request.input('actors', sql.VarChar(512), req.query.get('actors'));
                request.input('average_rating', sql.Int, 1);
                
                // save thumbnail and soundtrack to blob storage
                
                request.input('soundtrack', sql.VarChar(64), /* new soudtrack path */);
                request.input('thumbnail', sql.VarChar(64), /* new thumnail path */);
            
                const response = await request.query('INSERT INTO Movies (title, year, genre, description, director, actors) VALUES (@title, @year, @genre, @description, @director, @actors);');

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
