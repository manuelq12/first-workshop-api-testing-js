const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const urlBase = 'https://api.github.com';
const githubUserName = 'aperdomob';

describe('Github Api Test', () => {
  describe('Scenario: Users & Repositories', () => {
    describe(`Given a Github account like ${githubUserName}`, () => {
      describe(`When a PUT request is used to follow ${githubUserName}`, () => {
        let followResponse;
        before(async () => {
          followResponse = await agent.put(`${urlBase}/user/following/${githubUserName}`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Then response must return 204 code and empty body', () => {
          expect(followResponse.status).to.equal(statusCode.NO_CONTENT);
          expect(followResponse.body).to.eql({});
        });
      });

      describe(`When a GET request is used to verify ${githubUserName} is followed`, () => {
        let followedUser;
        before(async () => {
          const response = await agent.get(`${urlBase}/user/following`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');

          followedUser = response.body.find((element) => element.login === githubUserName);
        });

        it(`Then ${githubUserName} should be followed`, () => {
          expect(followedUser.login).to.equal(githubUserName);
        });
      });
      
      describe(`When a PUT request is used to follow ${githubUserName} again so we test the method is idempotent`, () => {
        let followResponse;
        before(async () => {
          followResponse = await agent.put(`${urlBase}/user/following/${githubUserName}`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Then response must return 204 code and empty body', () => {
          expect(followResponse.status).to.equal(statusCode.NO_CONTENT);
          expect(followResponse.body).to.eql({});
        });
      });

      describe(`When a GET request is used to verify ${githubUserName} is followed again`, () => {
        let followedUser;
        before(async () => {
          const response = await agent.get(`${urlBase}/user/following`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');

          followedUser = response.body.find((element) => element.login === githubUserName);
        });

        it(`Then ${githubUserName} should still be followed`, () => {
          expect(followedUser.login).to.equal(githubUserName);
        });
      });
    });
  });
});
