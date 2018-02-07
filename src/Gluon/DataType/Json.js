import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class Json extends PrimitiveType {
    static async fromStorage(storageValue) {
        return JSON.parse(storageValue);
    }

    static async toStorage(modelValue) {
        return JSON.stringify(modelValue);
    }
}
