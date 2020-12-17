const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const urlBase = 'https://api.github.com';

describe('Github Api Test', () => {
  describe('Scenario: Creating Issues', () => {
    describe('Given a Github account', () => {
      let userInfo;
      describe('When a GET request is used to retrieve the account information', () => {
        before(async () => {
          userInfo = await agent.get(`${urlBase}/user`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Then at least one public repository is expected', () => {
          expect(userInfo.status).to.equal(statusCode.OK);
          expect(userInfo.body.name).equal('Manuel Quintero');
          expect(userInfo.body.public_repos).to.be.at.least(1);
        });
      });

      describe('When a GET request is used to retrieve the accounts repository information', () => {
        let response;
        let repository;
        before(async () => {
          response = await agent.get(userInfo.body.repos_url)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
          const { body } = response;
          repository = body.shift();
        });

        it('Then the repository must exist', () => {
          expect(response.status).to.equal(statusCode.OK);
          expect(repository.full_name).to.not.equal('undefined');
        });

        describe('When a POST request is used to create an issue in the accounts repository', () => {
          const query = {
            title: 'API Created Issue'
          };
          let issueResponse;
          before(async () => {
            issueResponse = await agent.post(`https://api.github.com/repos/${repository.full_name}/issues`, query)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('Then the issue should have been created', () => {
            expect(issueResponse.status).to.equal(statusCode.CREATED);
            expect(issueResponse.body.id).to.not.equal('undefined');
            expect(issueResponse.body.title).to.equal(query.title);
            expect(issueResponse.body.body).to.equal(null);
          });

          describe('When a PATCH request is used to update the issue in the accounts repository', () => {
            const Updatequery = {
              body: 'API Created Issue new body'
            };
            before(async () => {
              response = await agent.patch(`https://api.github.com/repos/${repository.full_name}/issues/${issueResponse.body.number}`, Updatequery)
                .auth('token', process.env.ACCESS_TOKEN)
                .set('User-Agent', 'agent');
            });

            it('Then the issue should have been updated', () => {
              expect(response.status).to.equal(statusCode.OK);
              expect(response.body.title).to.equal(query.title);
              expect(response.body.body).to.equal(Updatequery.body);
            });
          });
        });
      });
    });
  });
});
