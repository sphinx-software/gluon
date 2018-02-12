import {TestSuite, testCase} from "WaveFunction";
import sinon from "sinon";
import {assert} from "chai";
import QueryScope from "../../../../src/Gluon/DatabaseRepository/QueryScope/QueryScope";

export default class QueryScopeTestSuite extends TestSuite {

    @testCase()
    testQueryScopeGetAllRegisteredScopes() {
        let queryScope = new QueryScope();

        queryScope.when('foo', () => {});
        queryScope.unless('bar', () => {});
        queryScope.always(() => {});

        assert.deepEqual(queryScope.getScopes(), ['foo', 'bar']);
    }

    @testCase()
    testQueryScopeMakesAQueryContextWithPositiveScopes() {
        let queryScope = new QueryScope();
        let fooScope = sinon.spy();
        let barScope = sinon.spy();

        let query    = {};

        queryScope
            .when('foo', fooScope)
            .when('bar', barScope)
        ;

        let context = queryScope.context(
            [
                {scope: 'foo', parameters: ['fooParameter']},
                {scope: 'bar', parameters: ['barParameter1', 'barParameter2']},
            ]
        );

        context.dispatch(query);

        assert(fooScope.calledWith(query, 'fooParameter'));
        assert(barScope.calledWith(query, 'barParameter1', 'barParameter2'));
    }

    @testCase()
    testQueryScopeMakesAContextWithDefaultScopes() {
        let queryScope   = new QueryScope();
        let defaultScope = sinon.spy();

        queryScope.always(defaultScope);

        let fooScope = sinon.spy();
        let barScope = sinon.spy();

        let query    = {};

        queryScope
            .when('foo', fooScope)
            .when('bar', barScope)
        ;

        let context = queryScope.context(
            [
                {scope: 'foo', parameters: ['fooParameter']},
                {scope: 'bar', parameters: ['barParameter1', 'barParameter2']},
            ]
        );

        context.dispatch(query);

        assert(defaultScope.calledWith(query));

        context = queryScope.context([
            {scope: 'foo', parameters: ['fooParameter']},
        ]);

        context.dispatch();
        assert(defaultScope.calledTwice);
    }


    @testCase()
    testQueryScopeMakesAContextWithNegativeScopes() {
        let queryScope    = new QueryScope();
        let fooScope      = sinon.spy();
        let barScope      = sinon.spy();
        let nahnahScope   = sinon.spy();
        let nohnohScope   = sinon.spy();

        let query    = {};

        queryScope
            .when('foo', fooScope)
            .when('bar', barScope)
            .unless('nahnah', nahnahScope)
            .unless('nohnoh', nohnohScope)
        ;


        let context = queryScope.context(
            [
                {scope: 'foo', parameters: ['fooParameter']},
                {scope: 'bar', parameters: ['barParameter1', 'barParameter2']},
                {scope: 'nohnoh'}
            ]
        );

        context.dispatch(query);

        assert(nahnahScope.calledWith(query));
        assert(nohnohScope.notCalled);

        context = queryScope.context([
            {scope: 'foo', parameters: ['fooParameter']},
        ]);

        context.dispatch(query);

        assert(nahnahScope.calledTwice);
        assert(nohnohScope.calledWith(query));
    }
}
