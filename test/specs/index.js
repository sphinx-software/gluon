import {default as chai, container, fusion, assert} from "chai";
import CredentialRepository from "../Credential/CredentialRepository";

describe('CredentialRepository gets credential', () => {
    it('should be true', async () => {
        let credentialRepository = await container.make(CredentialRepository);

        let credential = await credentialRepository.get(1);


        assert.equal('rikky', credential.username);
    });
});
