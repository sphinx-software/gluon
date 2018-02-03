# Gluon

A data modeling framework for Fusion.

*FYI, nuclear **fusion** is a reaction in which two or more atomic nuclei come close enough to form one or 
more different atomic nuclei and subatomic particles (neutrons or protons).*

***gluon** is an elementary particle which bonds those nuclei particles together after **fusion** reaction*

---

Let's start with Domain Driven Design basic concepts:


- Entity
- Value object
- Aggregation vs Reference
- Aggregate root
- Domain context
- Service layer
- Repository & Data Mapper


Okay, okay, enough talk! Let's write some codes

```javascript

@bind()
export class Credential {

    @type(PrimaryKey)
    id = 1;

    @type(String)
    username = '';

    @type(Hashed)
    password = '';
    
    @type(SoftDelete)
    deletedAt = null;
    
    @type(Timestamps, 'created_at', 'updated_at')
    timestamps = null;
}


@singleton()
@databaseRepository(Credential)
export class CredentialRepository extends DatabaseRepository {

}
```

And we are done!


```javascript

let credentialWithId1 = await credentialRepository.get(1);

let newCredential     = await credentialRepository.create({username: 'sexyRikky', password: 'I will not tell ya~!'});

let allOfCredentials  = await credentialRepository.all();

let deletedCredendeitals = await credentialWithId1.onlyTrash().all();


/// more and more stuff ;)
```

OKay. Now, let check this out!