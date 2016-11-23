/*
 * IBM Confidential
 * OCO Source Materials
 * IBM Concerto - Blockchain Solution Framework
 * Copyright IBM Corp. 2016
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */

'use strict';

const Connection = require('../lib/connection');
const ConnectionManager = require('../lib/connectionmanager');

require('chai').should();
const sinon = require('sinon');

describe('Connection', () => {

    let mockConnectionManager;

    beforeEach(() => {
        mockConnectionManager = sinon.createStubInstance(ConnectionManager);
    });

    describe('#constructor', () => {

        it('should set the connection manager', () => {
            let c = new Connection(mockConnectionManager);
            c.connectionManager.should.equal(mockConnectionManager);
        });

    });

    describe('#getConnectionManager', () => {

        it('should return the connection manager', () => {
            let c = new Connection(mockConnectionManager);
            c.getConnectionManager().should.equal(mockConnectionManager);
        });

    });

    describe('#disconnect', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.disconnect()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#login', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.login()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#deploy', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.deploy()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#ping', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.ping()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#queryChainCode', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.queryChainCode()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#invokeChainCode', () => {

        it('should throw as abstract method', () => {
            let c = new Connection(mockConnectionManager);
            return c.invokeChainCode()
                .then(() => {
                    throw new Error('should not get here');
                })
                .catch((error) => {
                    error.should.match(/abstract function called/);
                });
        });

    });

    describe('#toJSON', () => {

        it('should return an empty object', () => {
            let c = new Connection(mockConnectionManager);
            c.toJSON().should.deep.equal({});
        });

    });

});
