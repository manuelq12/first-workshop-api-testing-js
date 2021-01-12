const isomorphicFetch = require('isomorphic-fetch');
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);

const { expect } = chai;

const urlBase = 'https://api.github.com';
const promiseCode = `
function promiseExample() {
  return new Promise((resolve, reject) => {
    setTimeout(function(){
      resolve("¡Éxito!");
    }, 250);
`;

describe('Github Api Test', () => {
  describe('Scenario: Gists with Isomorphic Fetch', () => {
    describe('Given a Github account', () => {
      describe('When a POST request is used to place a GIST in the account', () => {
        const newGist = {
          files: { 'promiseExample.js': { content: promiseCode } },
          public: true,
          description: 'This code contains an example of a promise'
        };

        let gistJson;
        let responseStatus;

        before(async () => {
          const gistResponse = await isomorphicFetch(`${urlBase}/gists`, {
            method: 'POST',
            headers: {
              Authorization: `token ${process.env.ACCESS_TOKEN}`
            },
            body: JSON.stringify(newGist)
          });

          responseStatus = gistResponse.status;
          gistJson = await gistResponse.json();
        });

        it('Then a CREATED status code, a description, if its public and content are expected', () => {
          expect(responseStatus).to.equal(statusCode.CREATED);
          expect(gistJson).to.containSubset(newGist);
        });

        describe('When a GET request is used to retrieve the created GIST in the account', () => {
          let createdGistResponse;
          before(async () => {
            createdGistResponse = await isomorphicFetch(gistJson.url, {
              method: 'GET',
              headers: {
                Authorization: `token ${process.env.ACCESS_TOKEN}`
              }
            });
            responseStatus = createdGistResponse.status;
            gistJson = await createdGistResponse.json();
          });

          it('Then the response must have the GIST attributes', () => {
            expect(responseStatus).to.equal(statusCode.OK);
            expect(gistJson.description).to.equal(newGist.description);
          });
        });

        describe('When a DELETE request is used to delete the created GIST in the account', () => {
          let deleteGistResponse;
          before(async () => {
            deleteGistResponse = await isomorphicFetch(gistJson.url, {
              method: 'DELETE',
              headers: {
                Authorization: `token ${process.env.ACCESS_TOKEN}`
              }
            });
            responseStatus = deleteGistResponse.status;
          });

          it('Then the response must specify the GIST is Deleted', () => {
            expect(responseStatus).to.equal(statusCode.NO_CONTENT);
          });
        });

        describe('When a GET request is used to retrieve the deleted GIST in the account', () => {
          let deletedGistResponse;
          before(async () => {
            deletedGistResponse = await isomorphicFetch(gistJson.url, {
              method: 'GET',
              headers: {
                Authorization: `token ${process.env.ACCESS_TOKEN}`
              }
            });
            responseStatus = deletedGistResponse.status;
          });
          it('Then the response must say the GIST is not found', () => {
            expect(responseStatus).to.equal(statusCode.NOT_FOUND);
          });
        });
      });
    });
  });
});
