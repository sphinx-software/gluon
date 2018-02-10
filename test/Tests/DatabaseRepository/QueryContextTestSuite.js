import {TestSuite, testCase} from "WaveFunction";
import {assert} from "chai";
import sinon from "sinon";
import QueryContext from "../../../src/Gluon/DatabaseRepository/QueryScope/QueryContext";

export default class QueryContextTestSuite extends TestSuite {

    @testCase()
    testQueryContextDispatchByContext() {
        let mockScope1 = sinon.spy();
        let mockScope2 = sinon.spy();
        let query       = {};

        let context = new QueryContext([
            {
                scope: mockScope1,
                parameters: ['hello', 'world']
            },
            {
                scope: mockScope2,
                parameters: ['foo', 'bar']
            }
        ]);

        context.dispatch(query);

        assert(mockScope1.calledWith(query, 'hello', 'world'));
        assert(mockScope2.calledWith(query, 'foo', 'bar'));
    }
}
