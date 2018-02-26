import RepositoryTestSuite from "../../RepositoryTestSuite";
import {testCase} from "WaveFunction";
import {assert} from "chai";
import {ModelPersistenceEngine} from "Gluon";
import {Credential} from "../../TheCuteSocialNetwork";
import {
    EntitySchemaReader,
    NamingConvention,
    DataMapper
} from "Gluon";

export default class ModelPersistenceEngineTestSuite extends RepositoryTestSuite {

    engine = null;

    schema = null;

    async fusionActivated() {
        await super.fusionActivated(context);

        this.schema = new EntitySchemaReader(new NamingConvention()).read(Credential);
        this.engine = new ModelPersistenceEngine(this.dbm.connection(), new DataMapper(this.container));
    }

    @testCase()
    async testPersistenceEngineCanRunInsertOperationCorrectly(context) {
        let shouldBeCredential = await this.engine.insert({
            username: 'chucky',
            password: 'foobar',
            timestamps: {
                createdAt: new Date().getTime()
            }
        }, this.schema);

        assert.instanceOf(shouldBeCredential, Credential);
        assert.equal(shouldBeCredential.username, 'chucky');

        assert(await this.dbm.from('credentials').where('username', 'chucky').first());
    }
}
