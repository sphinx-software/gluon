import {TestSuite, testCase} from "WaveFunction";
import {DatabaseRepository} from "Gluon";
import QueryScope from "../../../src/Gluon/DatabaseRepository/QueryScope/QueryScope";
import sinon from "sinon";
import {assert} from 'chai';

export default class DatabaseRepositoryQueryScopeTestSuite extends TestSuite {

    async beforeEach(context) {
        this.repository = new DatabaseRepository();
    }

    @testCase()
    testTheRepositoryCanAddExtraMethodsForItSelfUsingQueryScope() {
        let queryScope     = new QueryScope();
        let getScopesStub  = sinon.stub(queryScope, 'getScopes');

        getScopesStub.returns(['foo', 'some foo', 'some-bar', 'Some   baz']);

        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;

        assert.isFunction(this.repository.withFoo);
        assert.isFunction(this.repository.withSomeFoo);
        assert.isFunction(this.repository.withSomeBar);
        assert.isFunction(this.repository.withSomeBaz);

        let withScopeStub = sinon.stub(this.repository, 'withScope');

        withScopeStub.returns(this.repository);

        this.repository.withFoo('fooParameter').withSomeFoo('someFooParameter').withSomeBar('someBarParameter').withSomeBaz('someBazParameter', 'someBazParameter2');

        assert(withScopeStub.calledWith('foo', 'fooParameter'));
        assert(withScopeStub.calledWith('some foo', 'someFooParameter'));
        assert(withScopeStub.calledWith('some-bar', 'someBarParameter'));
        assert(withScopeStub.calledWith('Some   baz', 'someBazParameter', 'someBazParameter2'));

        withScopeStub.restore();
    }

    @testCase()
    testTheRepositoryWillThrowErrorWhenAnExtraMethodNameIsColliedWithAPredefinedProperty() {
        let queryScope     = new QueryScope();
        let getScopesStub  = sinon.stub(queryScope, 'getScopes');

        getScopesStub.returns(['foo']);

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

        getScopesStub.returns(['foo-bar', 'foo  bar']);

        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;

        assert.isFunction(this.repository.withFooBar);

        this.repository.withFooBar('hello', 'world');

        assert(withScopeStub.calledWith('foo-bar', 'hello', 'world'));

        withScopeStub.restore();
    }

    @testCase()
    testTheRepositoryAppliesQueryScopesToItsQueryProcedure() {
        let queryScope     = new QueryScope();
        let contextStub    = sinon.stub(queryScope, 'context');


        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;
        this.repository
            .withScope('foo', 'fooParameter1', 'fooParameter2')
            .withScope('bar', 'barParameter1', 'barParameter2')
            .makeQueryScopeContext()
        ;

        assert(contextStub.calledWith([
            {scope: 'foo', parameters: ['fooParameter1', 'fooParameter2']},
            {scope: 'bar', parameters: ['barParameter1', 'barParameter2']}
        ]));
    }

    @testCase()
    testTheRepositoryAppliesQueryScopesDoesNotCausingRaceCondition() {
        let queryScope     = new QueryScope();
        let contextStub    = sinon.stub(queryScope, 'context');


        this.repository
            .setQueryScope(queryScope)
            .bootstrap()
        ;

        this.repository
            .withScope('bar', 'barParameter1', 'barParameter2')
            .makeQueryScopeContext()
        ;

        this.repository
            .withScope('foo', 'fooParameter1', 'fooParameter2')
            .makeQueryScopeContext()
        ;

        assert(contextStub.secondCall.calledWith([
            {scope: 'foo', parameters: ['fooParameter1', 'fooParameter2']}
        ]), 'Woo hoo, it\'s making race condition!');
    }
}
