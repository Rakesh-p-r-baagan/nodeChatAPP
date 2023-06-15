const socket =io();

//Elements sextion
const messageForm = document.querySelector('#message-form');
const messageFormInput = document.querySelector('input');
const messageFormButton=document.querySelector('#formButton');
const locationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

//templates
const messageTemplate =document.querySelector('#message-template').innerHTML;
const locationMessageTemplate =document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate =document.querySelector('#sidebar-template').innerHTML;

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

function autoscroll(){//this function is not working needs to be fixed
    //new message element
    const newMessage = messages.lastElementChild; //grabs the last child 
  

    //height of the new message
    const newMessageStyle= getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight =newMessage.offsetHeight + newMessageMargin //offsetHeight wont consider margin for height of new message so margin should be explicitly fetched

    //visible height of the contianer (i.e height of the visible part of the chat window)
    const visibleHeight = messages.offsetHeight

    //total height of the container
    const containerHeight = messages.scrollHeight

    //how for should it scroll automatically
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight-newMessageHeight>=scrollOffset)
    {
        messages.scrollTop = messages.scrollHeight;
        
    }
}
socket.on('message',(message)=>{
    // console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
});

socket.on('locationMessage',(url) => {
    console.log(url);
    const html= Mustache.render(locationMessageTemplate,{
        username:url.username,
        url: url.locationUrl,
        createdAt:moment(url.createdAt).format('h:mm a')

    })
    messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
});


socket.on('roomData',({room,users}) => {
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.getElementById('sidebar').innerHTML=html;
})

messageForm.addEventListener('submit',(e)=>{//e gets all the information from the form
    e.preventDefault();//prevents the refresh of the page when submitted

    messageFormButton.setAttribute('disabled', 'disabled');//to disable the submit button
    //form  gets disabled when submit is pressed,we will enable the submit button when the we receive the message recived acknowledgement from the server

    //const message = document.querySelector('input').value;//this is same as  const message = e.target.elements.message.value;
    const message = e.target.elements.message.value;//'message' is id of the input fiels in form


    socket.emit('sendMessage',message,(mes,err)=>{//the callback function will run when it recives acknowledgement from the server
       //re-enabling the form
       messageFormButton.removeAttribute('disabled');
       messageFormInput.value="";//to clear the input once it is sent
       messageFormInput.focus();
       
        if(err)
        {
            alert(err);
            return console.error(err);
        }

        // console.log('Message Status:',mes);                     //that the message has been sent,both message and and callback is sent as parameter to server's callback function  
    });

});

locationButton.addEventListener('click',()=>{
    locationButton.setAttribute('disabled','disabled');

    if(!navigator.geolocation){
        return alert("geo location not available in your browser");
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(navigator.geolocation);
       
        socket.emit('sendLocation',{//this is an object
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(mes,err)=>{//this is callback function.it is called to acknowledge that the message has been recived  by tthe server
            locationButton.removeAttribute('disabled');
            if(err)
        {
            return console.error(err);
        }

        console.log('Message Status:',mes);   
        });
    })
});

socket.emit('join',{username,room},(err)=>{
    if(err) 
    {
        alert(err);
        location.href='/';
    }
})