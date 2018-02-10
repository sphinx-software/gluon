import {type} from "../Entity";
import Timestamp from "./Timestamp";

export default class Timestamps {

    @type(Timestamp)
    createdAt = new Date();

    @type(Timestamp)
    updatedAt = null;

    toJson() {
        return {
            createdAt: this.createdAt.getTime(),
            updatedAt: this.updatedAt.getTime()
        }
    }
}
