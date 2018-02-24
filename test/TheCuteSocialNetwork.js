import {Hashed, PrimaryKey, String, Timestamps, Reference} from "Gluon/DataType";
import {aggregations, eager, hidden, readonly, type} from "Gluon/Entity";

export class Comment {
    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    content = null;

    @readonly()
    @type(Reference, 'commenter_id')
    commenter = null;

    @readonly()
    @type(Reference, 'post_id')
    post = null;
}

export class Post {

    @type(PrimaryKey)
    id = null;

    @type(String)
    title = null;

    @type(String)
    content = null;

    @eager()
    @aggregations(Comment, 'post_id')
    comments = null;

    @readonly()
    @type(Reference, 'credentials_id')
    author = null;
}

export class Credential {

    @type(PrimaryKey)
    id = null;

    @type(String)
    username = null;

    @aggregations(Post)
    posts = [];

    @hidden()
    @type(Hashed)
    password = null;

    @hidden()
    @type(Timestamps)
    timestamps = null;
}
