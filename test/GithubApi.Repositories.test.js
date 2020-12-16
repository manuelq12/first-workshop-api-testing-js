const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const md5 = require('md5');

chai.use(chaiSubset);

const { expect } = chai;

let userInfo = null;
const urlBase = 'https://api.github.com';
const githubUserName = 'aperdomob';
const repositoryName = 'jasmine-awesome-report';
const md5ReadMe = '0e62b07144b4fa997eedb864ff93e26b';

describe('Github Api Test', () => {
  describe('Users & Repositories', () => {
    before(async () => {
      userInfo = await agent.get(`${urlBase}/users/${githubUserName}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');
    });

    it('Via GET verb obtain user info', async () => {
      expect(userInfo.status).to.equal(statusCode.OK);
      expect(userInfo.body.name).equal('Alejandro Perdomo');
      expect(userInfo.body.company).equal('PSL');
      expect(userInfo.body.location).equal('Colombia');
    });

    it('Via GET verb obtain user repositories info', async () => {
      const response = await agent.get(userInfo.body.repos_url)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');

      const repository = response.body.find((element) => element.name === repositoryName);
      expect(response.status).to.equal(statusCode.OK);
      expect(repository.full_name).to.equal(`${githubUserName}/${repositoryName}`);
      expect(repository.private).to.equal(false);
      expect(repository.description).to.equal('An awesome html report for Jasmine');
    });

    it('Via GET verb download jasmine-awesome-report repository', async () => {
      const response = await agent.get(`${urlBase}/repos/${githubUserName}/${repositoryName}/zipball`)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');

      expect(response.status).to.equal(statusCode.OK);
      expect(response.header['content-type']).to.equal('application/zip');
    });

    it('Via GET verb obtain jasmine-awesome-report README.md info', async () => {
      const response = await agent.get(`${urlBase}/repos/${githubUserName}/${repositoryName}/contents`)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');

      const readme = response.body.find((element) => element.name === 'README.md');
      expect(readme).to.containSubset({
        path: 'README.md',
        sha: 'b9900ca9b34077fe6a8f2aaa37a173824fa9751d'
      });
    });

    it('Via GET verb download jasmine-awesome-report README.md and check MD5 hash', async () => {
      const contents = await agent.get(`${urlBase}/repos/${githubUserName}/${repositoryName}/contents`)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');

      const readme = contents.body.find((element) => element.name === 'README.md');
      const response = await agent.get(readme.download_url)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');

      const md5FileResponse = md5(response.text);

      expect(md5FileResponse).to.equal(md5ReadMe);
    });
  });
});
