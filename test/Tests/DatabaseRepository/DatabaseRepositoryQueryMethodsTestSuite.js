import {testCase} from "WaveFunction";
import RepositoryTestSuite from "../../RepositoryTestSuite";
import {DatabaseRepository} from "Gluon";
import QueryScope from "../../../src/Gluon/DatabaseRepository/QueryScope/QueryScope";
import {DatabaseManagerInterface} from "Fusion";

export default class DatabaseRepositoryQueryMethodsTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {
        this.repository = new DatabaseRepository()
            .setQueryScope(new QueryScope())
            .bootstrap()
        ;

        this.dbm = await this.container.make(DatabaseManagerInterface);
    }

    async beforeEach() {
        await this.dbm.from('credentials').truncate();

        await this.dbm.from('credentials').insert([
            { username: 'rikky' },
            { username: 'lucy'  },
            { username: 'rocky' },
        ])
    }

    async afterEach() {
        await this.dbm.from('credentials').truncate();
    }

    @testCase()
    async testAllMethod(context) {
        // todo
        context.skip();
    }
}