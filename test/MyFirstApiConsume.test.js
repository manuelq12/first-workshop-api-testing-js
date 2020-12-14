const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

describe('First Api Tests', () => {
  it('Consume GET Service', async () => {
    const response = await agent.get('https://httpbin.org/ip');

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body).to.have.property('origin');
  });

  it('After Consume GET Service with query parameters', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.get('https://httpbin.org/get').query(query);
    expect(response.status).to.equal(statusCode.OK);
    expect(response.body.args).to.eql(query);
  });

  it('Then Consume HEAD Service', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.get('https://httpbin.org/get').query(query);
    expect(response.status).to.equal(statusCode.OK);
    expect(response.header.server).to.eql('gunicorn/19.9.0');
  });

  it('Later Consume PATCH Service', async () => {
    const query = {
      name: 'PATCH Query'
    };

    const response = await agent.patch('https://httpbin.org/patch').query(query);
    expect(response.status).to.equal(statusCode.OK);
    expect(response.body.args.name).to.equal(query.name);
  });

  it('After Consume PUT Service', async () => {
    const query = {
      name: 'PUT Query'
    };

    const response = await agent.put('https://httpbin.org/put').query(query);
    expect(response.status).to.equal(statusCode.OK);
    expect(response.body.args.name).to.equal(query.name);
  });

  it('Finally Consume DELETE Service', async () => {
    const query = {
      name: 'DELETE Query'
    };

    const response = await agent.delete('https://httpbin.org/delete').query(query);
    expect(response.status).to.equal(statusCode.OK);
    expect(response.body.args.name).to.equal(query.name);
  });
});
