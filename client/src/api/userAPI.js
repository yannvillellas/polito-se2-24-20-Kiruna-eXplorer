const SERVER_URL = 'http://localhost:3001/api/users';

const createUser = (credentials) => {
    const user = fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    }).then(response => response.json());

    return user
}

const UserAPI = {createUser};

export default UserAPI;