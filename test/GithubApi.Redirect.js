const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

describe('Github Api Test', () => {
  describe('Scenario: HEAD requests', () => {
    describe('Given a repository whose name has changed', () => {
      const oldRepository = 'https://github.com/aperdomob/redirect-test';
      const newRepository = 'https://github.com/aperdomob/new-redirect-test';

      describe('When a HEAD request is used to get the old repository info', () => {
        let oldHeadResponse;

        before(async () => {
          try {
            await agent.head(oldRepository)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          } catch (response) {
            oldHeadResponse = response;
          }
        });

        it('Then the response should show a redirect information', () => {
          expect(oldHeadResponse.status).to.equal(statusCode.MOVED_PERMANENTLY);
          expect(oldHeadResponse.response.headers.location).to.equal(newRepository);
        });

        describe('When a GET request is used to check the redirect to the new repository', () => {
          let redirectResponse;
          before(async () => {
            redirectResponse = await agent.get(oldRepository)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('Then the response should show a redirect information', () => {
            expect(redirectResponse.status).to.equal(statusCode.OK);
          });
        });
      });
    });
  });
});
