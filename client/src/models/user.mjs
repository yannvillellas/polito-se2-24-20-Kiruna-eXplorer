class User{
    constructor(id, username, password, salt, role){
        this.id = id;
        this.username = username;
        this.password = password;
        this.salt = salt;
        this.role = role;
    }
}

export default User;