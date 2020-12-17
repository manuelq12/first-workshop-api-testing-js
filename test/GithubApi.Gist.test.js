const agent = require('superagent');
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
  describe('Scenario: Gists', () => {
    describe('Given a Github account', () => {
      describe('When a POST request is used to place a GIST in the account', () => {
        const newGist = {
          files: { 'promiseExample.js': { content: promiseCode } },
          public: true,
          description: 'This code contains an example of a promise'
        };

        let gistResponse;

        before(async () => {
          gistResponse = await agent.post(`${urlBase}/gists`, newGist)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Then a CREATED status code, a description, if its public and content are expected', () => {
          expect(gistResponse.status).to.equal(statusCode.CREATED);
          expect(gistResponse.body).to.containSubset(newGist);
        });

        describe('When a GET request is used to retrieve the created GIST in the account', () => {
          let createdGistResponse;
          before(async () => {
            createdGistResponse = await agent.get(gistResponse.body.url)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('Then the response must have the GIST attributes', () => {
            expect(createdGistResponse.status).to.equal(statusCode.OK);
            expect(createdGistResponse.body.description).to.equal(newGist.description);
          });
        });

        describe('When a DELETE request is used to delete the created GIST in the account', () => {
          let deleteGistResponse;
          before(async () => {
            deleteGistResponse = await agent.delete(gistResponse.body.url)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('Then the response must specify the GIST is Deleted', () => {
            expect(deleteGistResponse.status).to.equal(statusCode.NO_CONTENT);
          });
        });

        describe('When a GET request is used to retrieve the deleted GIST in the account', () => {
          let deletedGistResponse;
          before(async () => {
            try {
              await agent.get(gistResponse.body.url)
                .auth('token', process.env.ACCESS_TOKEN)
                .set('User-Agent', 'agent');
            } catch (response) {
              deletedGistResponse = response;
            }
          });

          it('Then the response must say the GIST is not found', () => {
            expect(deletedGistResponse.status).to.equal(statusCode.NOT_FOUND);
          });
        });
      });
    });
  });
});
