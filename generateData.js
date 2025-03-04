import { faker } from '@faker-js/faker';

// Generér én fake bruger
const generateFakeUser = () => {
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
        },
        createdAt: faker.date.past()
    };
};

// Generér en liste med 10 brugere
const generateUsers = (count = 10) => {
    return Array.from({ length: count }, () => generateFakeUser());
};

// Udskriv faker-data
console.log(generateUsers(10));
