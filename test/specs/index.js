import {default as chai, container, fusion, assert} from "chai";
import CredentialRepository from "../Credential/CredentialRepository";

describe('DatabaseRepository', () => {
    describe('#get()', () => {
        let credentialRepository = null;

        beforeEach(async () => {
            credentialRepository = await container.make(CredentialRepository);
        });

        it('can get an entity by its primary key', async () => {
            let credential = await credentialRepository.get(1);

            assert.equal('rikky', credential.username);
        });

        it('return null when no entity was found', async () => {
            assert.equal(null, await credentialRepository.get(100))
        });

        it('can return default entity when no entity was found', async () => {
            assert.equal('Foobar', await credentialRepository.get(100, 'Foobar'))
        });
    })
});
