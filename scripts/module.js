Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {

});

Hooks.on('renderApplication', (app, html, data) => {
    if(typeof app === FilePicker){
        if(app._tabs[0].active === 's3'){
            for(file in data.files){
                let domain = (new URL(file.url))
                domain.hostname = "eu2.contabostorage.com"
                domain.pathname = "15a156a10fc44b3389695a25bae08894:foundry/"+domain.pathname
                file.url = domain.toString()
            }
        }
    }
})
