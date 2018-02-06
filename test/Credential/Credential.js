import {type, String, PrimaryKey} from "Gluon";
import {bind} from "Fusion/MetaInjector";

@bind()
export default class Credential {

    @type(PrimaryKey)
    id = null;

    @type(String)
    username = '';
}
