const agent = require('superagent');
const statusCode = require('http-status-codes');
const responseTime = require('superagent-response-time');
const { expect } = require('chai');

const urlBase = 'https://api.github.com';

describe('Github Api Test', () => {
  describe('Scenario: Response Time', () => {
    describe('Given a Github account', () => {
      describe('When a GET request is used to retrieve all users', () => {
        let getAllResponse;
        let respTime;
        before(async () => {
          getAllResponse = await agent.get(`${urlBase}/users`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .use(responseTime((callback, time) => {
              respTime = time;
            }));
        });

        it('Then the delay of the response must be below 5000ms', () => {
          expect(getAllResponse.status).to.equal(statusCode.OK);
          expect(respTime).to.be.below(5000);
        });

        it('And the response must  have a maximum of 30 users', () => {
          expect(getAllResponse.body.length).to.be.equal(30);
        });
      });

      describe('When a GET request is used to retrieve only 10 users', () => {
        let tenUsersResponse;
        const query = { per_page: 10 };
        before(async () => {
          tenUsersResponse = await agent.get(`${urlBase}/users`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .query(query);
        });

        it('Then the response must contain only 10 users', () => {
          expect(tenUsersResponse.body.length).to.be.equal(10);
        });
      });

      describe('When a GET request is used to retrieve only 50 users', () => {
        let fiftyUsersResponse;
        const query = { per_page: 50 };
        before(async () => {
          fiftyUsersResponse = await agent.get(`${urlBase}/users`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .query(query);
        });

        it('Then the response must contain only 50 users', () => {
          expect(fiftyUsersResponse.body.length).to.be.equal(50);
        });
      });
    });
  });
});
