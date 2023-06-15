const users=[];

function addUser({id,username,room}){
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data 
    if(!username || !room)
    {
        return {
            error:"username and room are required"
        }
    }

    //check if the user name is already in use by others in the same room(i.e user with same username can be in different room but two users with same username cannot  be  in same room)
    const existingUser = users.find((user)=> {
        return user.username === username && user.room === room;
    })

    //validate the user
    if(existingUser)
    {
        
        return {
            error:"username already in use"
        }
    }

    const user={id,username,room}
    users.push(user);

    return {user};
}

function removeUser(id)
{
    const index=users.findIndex(user=>user.id === id);
    if(index !== -1)
    {
        return users.splice(index, 1)[0];//it return an array so we use [0]
    }
}

function getUser(id)
{
    const user=users.find(user=>user.id === id);
    return user;
}

function getUsersInRoom(room)
{
    const usersArray=users.filter(user=>user.room === room);
    return usersArray;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
    
}