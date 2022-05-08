let SETTINGS = {
    CUSTOM_PREFIX:"custom_prefix"
}
let ID = 's3-custom-path'


Hooks.once('init', async function() {
    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM){
        ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it.");
        return;
    }

    //Register Setting

    game.settings.register(ID, SETTINGS.CUSTOM_PREFIX, {
        name: `S3_CUSTOM_URL.settings.${SETTINGS.CUSTOM_PREFIX}.Name`,
        default: "https://url.to.endpoint.com/bucket",
        type: String,
        scope: 'world',
        config: true,
        hint: `S3_CUSTOM_URL.settings.${SETTINGS.CUSTOM_PREFIX}.Hint`,
    });

    //register wrappers
    libWrapper.register(ID, "FilePicker.constructor.upload", function(wrapped, ...args){
        let result = wrapped(...args);
        if(args[0] === "s3"){
            let originalURL = result.path;
            result.path = transformURL(originalUrl);
        }
    }, libWrapper.WRAPPER);
    libWrapper.register(ID, "FilePicker.constructor.browse", function(wrapped, ...args){
        let result = wrapped(...args);
        if(args[0] === "s3"){
            result.files.forEach(file, index => {
                let originalUrl = file
                result.files[index] = transformURL(originalUrl);
            });
        }
    }, libWrapper.WRAPPER);
});

function transformURL(url){
    var newUrl = url,
        delimiter = '/',
        start = 3,
        tokens = newUrl.split(delimiter).slice(start),
        path = tokens.join(delimiter);

    return game.settings.get(ID, SETTINGS.CUSTOM_PREFIX);
}
