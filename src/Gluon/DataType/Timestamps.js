import {type} from "../Entity";
import Timestamp from "./Timestamp";
import {bind} from "Fusion/MetaInjector";

@bind()
export default class Timestamps {

    @type(Timestamp)
    createdAt = null;

    @type(Timestamp)
    updatedAt = null;

    toJson() {
        return {
            createdAt: this.createdAt.getTime(),
            updatedAt: this.updatedAt.getTime()
        }
    }
}
