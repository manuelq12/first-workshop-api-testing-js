const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const md5 = require('md5');

chai.use(chaiSubset);

const { expect } = chai;

const urlBase = 'https://api.github.com';
const githubUserName = 'aperdomob';
const repositoryName = 'jasmine-awesome-report';

describe('Github Api Test', () => {
  describe('Scenario: Users & Repositories', () => {
    describe(`Given a Github account like ${githubUserName}`, () => {
      let userInfo;
      describe(`When a GET request is used to retrieve ${githubUserName} information`, () => {
        before(async () => {
          userInfo = await agent.get(`${urlBase}/users/${githubUserName}`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });
        it(`Then ${githubUserName}'s name, company and location are expected`, () => {
          expect(userInfo.status).to.equal(statusCode.OK);
          expect(userInfo.body.name).equal('Alejandro Perdomo');
          expect(userInfo.body.company).equal('PSL');
          expect(userInfo.body.location).equal('Colombia');
        });
      });

      describe(`When a GET request is used to retrieve ${githubUserName}'s ${repositoryName} repository information`, () => {
        let response;
        let repository;
        before(async () => {
          response = await agent.get(userInfo.body.repos_url)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
          repository = response.body.find((element) => element.name === repositoryName);
        });

        it(`Then ${repositoryName}'s full name, private and description are expected`, () => {
          expect(response.status).to.equal(statusCode.OK);
          expect(repository.full_name).to.equal(`${githubUserName}/${repositoryName}`);
          expect(repository.private).to.equal(false);
          expect(repository.description).to.equal('An awesome html report for Jasmine');
        });
      });

      describe(`When a GET request is used to download ${githubUserName}'s ${repositoryName} repository`, () => {
        let response;
        before(async () => {
          response = await agent.get(`${urlBase}/repos/${githubUserName}/${repositoryName}/zipball`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Then the response must return a status code 200, and the content type must be a zip', () => {
          expect(response.status).to.equal(statusCode.OK);
          expect(response.header['content-type']).to.equal('application/zip');
        });
      });

      describe(`When a GET request is used to retrieve ${githubUserName}'s ${repositoryName} README.md info`, () => {
        let contents;
        let readme;
        before(async () => {
          contents = await agent.get(`${urlBase}/repos/${githubUserName}/${repositoryName}/contents`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');

          readme = contents.body.find((element) => element.name === 'README.md');
        });

        it('Then the README.md info must return a path, and it\'s sha', () => {
          expect(readme).to.containSubset({
            path: 'README.md',
            sha: 'b9900ca9b34077fe6a8f2aaa37a173824fa9751d'
          });
        });

        describe(`When a GET request is used to download ${githubUserName}'s ${repositoryName} README.md and it's MD5 is calculated`, () => {
          let response;
          let md5FileResponse;
          const md5ReadMe = '0e62b07144b4fa997eedb864ff93e26b';
          before(async () => {
            response = await agent.get(readme.download_url)
              .auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');

            md5FileResponse = md5(response.text);
          });

          it('Then the README.md MD5 calculated and the one calculated before most be equal', () => {
            expect(md5FileResponse).to.equal(md5ReadMe);
          });
        });
      });
    });
  });
});
