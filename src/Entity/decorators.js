export function hidden() {
    return (target, property) => {
        let metadata = Reflect.getMetadata('gluon.entity.hidden', target.constructor) || [];
        metadata.push(property);
        return Reflect.defineMetadata('gluon.entity.hidden', metadata, target.constructor);
    }
}

export function readonly() {
    return (target, property) => {
        let metadata = Reflect.getMetadata('gluon.entity.readonly', target.constructor) || [];
        metadata.push(property);
        return Reflect.defineMetadata('gluon.entity.readonly', metadata, target.constructor);
    }
}

export function type(DataType, ...fieldName) {
    return (target, property) => {
        let metadata = Reflect.getMetadata('gluon.entity.fields', target.constructor) || {};
        metadata[property] = {
            type: DataType,
            name: fieldName
        };
        return Reflect.defineMetadata('gluon.entity.fields', metadata, target.constructor);
    }
}
