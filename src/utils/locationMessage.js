const generateLocationMessage = (url)=>{
    return {
        locationUrl: url,
        createdAt: new Date().getTime()

    }
}

module.exports ={
    generateLocationMessage
}