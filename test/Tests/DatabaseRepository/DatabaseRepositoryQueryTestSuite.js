import RepositoryTestSuite from "../../RepositoryTestSuite";
import {testCase} from "WaveFunction";
import {CredentialRepository, Credential} from "Tests/Credential/index";
import {DatabaseManagerInterface} from "Fusion";
import {assert} from "chai";

export default class DatabaseRepositoryQueryTestSuite extends RepositoryTestSuite {

    repository = null;

    fixtures   = [{username: 'rikky'}, {username: 'lucy'}, {username: 'betty'}, {username: 'rocky'}];

    async fusionActivated(context) {
        this.repository = await this.container.make(CredentialRepository);
        this.dbm        = await this.container.make(DatabaseManagerInterface);
    }

    async beforeEach(context) {
        await this.dbm.from('credentials').insert(this.fixtures);
    }

    async afterEach(context) {
        await this.dbm.from('credentials').truncate();
    }

    @testCase()
    async testGetEntityByItsIdentifier() {
        let firstEntity  = await this.repository.get(1);
        let shouldBeNull = await this.repository.get(5);
        let defaultValue = await this.repository.get(5, 'Default');

        assert.equal(firstEntity.username, 'rikky');
        assert.isNull(shouldBeNull);
        assert.equal(defaultValue, 'Default');
    }

    @testCase()
    async testListAllEntities() {
        let allEntities = await this.repository.all();

        assert.lengthOf(allEntities, this.fixtures.length);
        assert.equal(allEntities[0].username, 'rikky');
        assert.equal(allEntities[1].username, 'lucy');
        assert.equal(allEntities[2].username, 'betty');
        assert.equal(allEntities[3].username, 'rocky');
    }

    @testCase()
    async testAddAnEntity() {
        let newEntity = await this.repository.create({username: 'nancy'});

        assert.instanceOf(newEntity, Credential);
        assert.equal(newEntity.username, 'nancy');
        assert(newEntity.id);

        let recordInDatabase = await this.dbm.from('credentials').where('username', '=', 'nancy').first();

        assert(recordInDatabase);
    }

    @testCase()
    async testFindEntitiesByAGivenCondition() {
        let condition = {
            decorate: (query) => {
                query.where('username', 'like', 'r%ky')
            }
        };

        let results = await this.repository.find(condition);

        assert.lengthOf(results, 2);
        assert.equal(results[0].username, 'rikky');
        assert.equal(results[1].username, 'rocky');
    }
}
