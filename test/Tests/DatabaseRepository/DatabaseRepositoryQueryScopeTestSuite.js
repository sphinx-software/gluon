import {TestSuite, testCase} from "WaveFunction";
import {DatabaseRepository} from "Gluon";
import QueryScope from "../../../src/Gluon/DatabaseRepository/QueryScope/QueryScope";
import sinon from "sinon";
import {assert} from 'chai';

export default class DatabaseRepositoryQueryScopeTestSuite extends TestSuite {

    beforeEach(context) {
        this.repository = new DatabaseRepository();
    }

    @testCase()
    testTheRepositoryCanAddExtraMethodsForItSelfUsingQueryScope() {
        let queryScope     = new QueryScope();
        let getScopesStub  = sinon.stub(queryScope, 'getScopes');

        getScopesStub.onCall(0).returns(['foo', 'some foo', 'some-bar', 'Some   baz']);

        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;

        assert.isFunction(this.repository.withFoo);
        assert.isFunction(this.repository.withSomeFoo);
        assert.isFunction(this.repository.withSomeBar);
        assert.isFunction(this.repository.withSomeBaz);

        let withScopeStub = sinon.stub(this.repository, 'withScope');

        withScopeStub.restore();
    }

    @testCase()
    testTheRepositoryWillThrowErrorWhenAnExtraMethodNameIsColliedWithAPredefinedProperty() {
        let queryScope     = new QueryScope();
        let getScopesStub  = sinon.stub(queryScope, 'getScopes');

        getScopesStub.onCall(0).returns(['foo']);

        Reflect.defineProperty(this.repository, 'withFoo', {value: 'any thing'});

        assert.throws(() => {
            this.repository
                .setQueryScope(queryScope)
                .bootstrap()
            ;
        }, 'E_QUERY_SCOPE_METHOD: Could not make new alias function for the query scope [foo].' +
            ' Property [withFoo] is already defined'
        );
    }

    @testCase()
    testTheRepositoryWhenTheExtraMethodNamesAreCollidedWithEachOtherShouldProxyToTheFirstOne() {
        let queryScope     = new QueryScope();
        let getScopesStub  = sinon.stub(queryScope, 'getScopes');
        let withScopeStub  = sinon.stub(this.repository, 'withScope');

        getScopesStub.onCall(0).returns(['foo-bar', 'foo  bar']);

        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;

        assert.isFunction(this.repository.withFooBar);

        this.repository.withFooBar('hello', 'world');

        assert(withScopeStub.calledWith('foo-bar', 'hello', 'world'));
    }
}
