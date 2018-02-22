import RepositoryTestSuite, {Credential} from "../../RepositoryTestSuite";
import {testCase} from "WaveFunction";
import {assert} from "chai";
import {
    DataMapper, EntitySchemaReader, ModelQueryBuilder, MacroBuilder,
    ModelQueryEngine, NamingConvention, DatabaseRepository, EntityNotFoundError
} from "Gluon";

class NoOne {

    username = 'I am no one ༼˵⊙︿⊙˵༽';
}

class CredentialRepository extends DatabaseRepository {

    async returnWhenGetNull() {
        return new NoOne();
    }
}


export default class DatabaseRepositoryTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {

        await super.fusionActivated(context);

        let engine = new ModelQueryEngine(new DataMapper(this.container), new ModelQueryBuilder(), this.dbm.connection());
        let schema = new EntitySchemaReader(new NamingConvention()).read(Credential);

        this.repository = new CredentialRepository()
            .setModel(Credential, schema)
            .setModelQueryEngine(engine)
            .setMacroBuilder(new MacroBuilder())
        ;

        this.repository.bootstrap();
    }

    fixtures() {
        return {
            credentials: [
                { username: 'rikky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
                { username: 'lucy' , created_at: new Date().getTime(), updated_at: new Date().getTime() },
                { username: 'rocky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
            ],

            posts: [
                { credentials_id: 1, title: 'Fusion', content: 'The cute framework' },
                { credentials_id: 1, title: 'Gluon', content: 'The cute data modeler' },
                { credentials_id: 1, title: 'WaveFunction', content: 'The cute testing tool' }
            ],

            comments: [
                { commenter_id: 2, post_id: 1, content: 'Is it cute?' },
                { commenter_id: 1, post_id: 1, content: 'Yes, sure!' },
                { commenter_id: 3, post_id: 1, content: 'But it needs to be more cute.' },
                { commenter_id: 1, post_id: 1, content: 'Okay, We\'ll try our best.' },
            ]
        }
    }

    @testCase()
    async testGetMethods() {
        let rikky = await this.repository.get(1);

        assert.equal(rikky.id, 1);
        assert.equal(rikky.username, 'rikky');
    }

    @testCase()
    async testAllMethod() {
        let credentials = await this.repository.all();

        assert.lengthOf(credentials, 3);
        assert.equal(credentials[0].username, 'rikky');
        assert.equal(credentials[1].username, 'lucy');
        assert.equal(credentials[2].username, 'rocky');
    }


    @testCase()
    async testGetMethodShouldReturnDefaultModelWhenNoModelFound() {
        let shouldBeNoOne = await this.repository.get(25121990);

        assert.instanceOf(shouldBeNoOne, NoOne);
    }

    @testCase('Test getOrDefault method should return the given default value when no model found')
    async testGetOrDefaultMethod() {
        let shouldBeEqualDefault = await this.repository.getOrDefault(25121990, 'default');

        assert(shouldBeEqualDefault, 'default');
    }

    @testCase('Test getOrFail method show throw the E_ENTITY_NOT_FOUND error when no model found')
    async testGetOrFail() {
        try {
            await this.repository.getOrFail(25121990);
        } catch (error) {
            return assert.instanceOf(error, EntityNotFoundError);
        }

        throw new Error('Jeez! It\'s not throwing!!!');
    }
}