import {type} from "../Entity";
import Timestamp from "./Timestamp";

export default class SoftDelete {
    @type(Timestamp)
    deletedAt = new Date();

    toJson() {
        return this.deletedAt.getTime();
    }
}
